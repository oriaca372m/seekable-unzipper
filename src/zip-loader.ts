import { parseCentralDirectoryHeader } from './central-directory-header'
import { LocalFileHeader, parseLocalFileHeader } from './local-file-header'
import { parseEndOfCentralDirectoryRecord } from './end-of-central-directory-record'
import { FileSeekableBuffer } from './seekable-buffer'
import * as zlib from 'zlib'
import { ISeekableBuffer } from './seekable-buffer'
import { Readable } from 'stream'

function decode(sbuf: ISeekableBuffer, header: LocalFileHeader): Readable {
	const compressedStream = sbuf.readStream(header.compressedDataOffset, header.compressedSize)
	if (header.compressionMethod === 'deflate') {
		return compressedStream.pipe(zlib.createInflateRaw())
	} else if (header.compressionMethod === 'no-compression') {
		return compressedStream
	}

	throw new Error(`unsupported compression method!: ${header.compressionMethod}`)
}

async function readAll(rs: Readable): Promise<Buffer> {
	const buffers: Buffer[] = []
	for await (const chunk of rs) {
		buffers.push(chunk)
	}

	return Buffer.concat(buffers)
}

export class ZipEntry {
	constructor(private readonly _loader: ZipLoader, private readonly _lfh: LocalFileHeader) {}

	get fileName(): string {
		return this._lfh.fileName
	}

	getContentStream(): Readable {
		return decode(this._loader.sbuf, this._lfh)
	}

	async getContentBuffer(): Promise<Buffer> {
		return await readAll(this.getContentStream())
	}
}

export class ZipLoader {
	private readonly _entries: ZipEntry[] = []

	constructor(
		private readonly _sbuf: ISeekableBuffer,
		private readonly _finalizer: () => Promise<void>
	) {}

	async init(): Promise<void> {
		const eocd = await parseEndOfCentralDirectoryRecord(this._sbuf)
		let cdhOffset = eocd.offsetOfStartOfCentralDirectoryWithRespectToTheStartingDiskNumber

		for (let i = 0; i < eocd.totalNumberOfEntriesInTheCentralDirectory; i++) {
			const cdh = await parseCentralDirectoryHeader(this._sbuf, cdhOffset)
			const lfh = await parseLocalFileHeader(this._sbuf, cdh.relativeOffsetOfLocalHeader)
			cdhOffset += cdh.totalSize

			if (lfh.fileName.endsWith('/')) {
				continue
			}

			this._entries.push(new ZipEntry(this, lfh))
		}
	}

	async finalize(): Promise<void> {
		await this._finalizer()
	}

	get entries(): readonly ZipEntry[] {
		return this._entries
	}

	get sbuf(): ISeekableBuffer {
		return this._sbuf
	}

	static async fromFile(path: string): Promise<ZipLoader> {
		const sbuf = new FileSeekableBuffer(path)
		await sbuf.init()
		return new ZipLoader(sbuf, async () => {
			await sbuf.finalize()
		})
	}
}
