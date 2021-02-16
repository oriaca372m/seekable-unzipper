import { promises as fs, createReadStream } from 'fs'
import { Readable } from 'stream'

export interface ISeekableBuffer {
	read(offset: number, length: number): Promise<Buffer>
	readStream(offset: number, length: number): Readable
	length(): number
}

export class FileSeekableBuffer implements ISeekableBuffer {
	private handle!: fs.FileHandle
	private _length!: number
	constructor(private path: string) {}

	async init(): Promise<void> {
		this.handle = await fs.open(this.path, 'r')
		this._length = (await this.handle.stat()).size
	}

	async finalize(): Promise<void> {
		await this.handle.close()
	}

	async read(offset: number, length: number): Promise<Buffer> {
		const buf = Buffer.alloc(length)
		await this.handle.read(buf, 0, length, offset)
		return buf
	}

	readStream(offset: number, length: number): Readable {
		return createReadStream('', {
			// eslint-disable-next-line
			fd: this.handle as any,
			// startとendはinclusive
			start: offset,
			end: offset + length - 1,
			autoClose: false,
		})
	}

	length(): number {
		return this._length
	}
}
