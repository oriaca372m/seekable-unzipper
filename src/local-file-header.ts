import { ISeekableBuffer } from './seekable-buffer'
import { DosDate, DosTime, parseDosDate, parseDosTime } from './dos-datetime'
import { CompressionMethod, parseCompressionMethod } from './compression-method'

export type LocalFileHeader = {
	// (4 bytes)
	// localFileHeaderSignature: 0x04034b50

	// (2 bytes)
	versionNeededToExtract: Buffer

	// (2 bytes)
	generalPurposeBitFlag: Buffer

	// (2 bytes)
	compressionMethod: CompressionMethod

	// (2 bytes)
	lastModFileTime: DosTime

	// (2 bytes)
	lastModFileDate: DosDate

	// (4 bytes)
	crc32: Buffer

	// (4 bytes)
	compressedSize: number

	// (4 bytes)
	uncompressedSize: number

	// (2 bytes)
	// fileNameLength: number

	// (2 bytes)
	// extraFieldLength: number

	// (Variable)
	fileName: string

	// (Variable)
	extraField?: Buffer

	totalSize: number

	// ファイルの先頭からこのエントリの圧縮データまでのオフセット
	compressedDataOffset: number
}

const totalConstantsSize = 30

export async function parseLocalFileHeader(
	sbuf: ISeekableBuffer,
	sbufOffset: number
): Promise<LocalFileHeader> {
	let buf = await sbuf.read(sbufOffset, totalConstantsSize)
	let offset = 0

	const signature = buf.readUInt32LE(offset)
	offset += 4
	if (signature !== 0x04034b50) {
		throw new Error('An invalid signature!: 0x' + signature.toString(16))
	}

	// ゆるして
	const header: LocalFileHeader = {} as LocalFileHeader

	header.versionNeededToExtract = buf.subarray(offset, offset + 2)
	offset += 2

	header.generalPurposeBitFlag = buf.subarray(offset, offset + 2)
	offset += 2

	header.compressionMethod = parseCompressionMethod(buf.readUInt16LE(offset))
	offset += 2

	header.lastModFileTime = parseDosTime(buf.readUInt16LE(offset))
	offset += 2

	header.lastModFileDate = parseDosDate(buf.readUInt16LE(offset))
	offset += 2

	header.crc32 = buf.subarray(offset, offset + 4)
	offset += 4

	header.compressedSize = buf.readUInt32LE(offset)
	offset += 4

	header.uncompressedSize = buf.readUInt32LE(offset)
	offset += 4

	const fileNameLength = buf.readUInt16LE(offset)
	offset += 2

	const extraFieldLength = buf.readUInt16LE(offset)
	offset += 2

	const totalVariablesSize = fileNameLength + extraFieldLength
	buf = await sbuf.read(sbufOffset + offset, totalVariablesSize)
	offset = 0

	header.fileName = buf.toString('utf-8', offset, offset + fileNameLength)
	offset += fileNameLength

	if (extraFieldLength !== 0) {
		header.extraField = buf.subarray(offset, offset + extraFieldLength)
		offset += extraFieldLength
	}

	header.totalSize = totalConstantsSize + totalVariablesSize
	header.compressedDataOffset = sbufOffset + header.totalSize

	return header
}
