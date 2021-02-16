import { ISeekableBuffer } from 'Src/seekable-buffer'
import { DosDate, DosTime, parseDosDate, parseDosTime } from 'Src/dos-datetime'
import { CompressionMethod, parseCompressionMethod } from 'Src/compression-method'

export type CentralDirectoryHeader = {
	// (4 bytes)
	// centralFileHeaderSignature: 0x02014b50

	// (2 bytes)
	versionMadeBy: Buffer

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

	// (2 bytes)
	// fileCommentLength: number

	// (2 bytes)
	diskNumberStart: number

	// (2 bytes)
	internalFileAttributes: Buffer

	// (4 bytes)
	externalFileAttributes: Buffer

	// (4 bytes)
	relativeOffsetOfLocalHeader: number

	// (Variable)
	fileName: string

	// (Variable)
	extraField?: Buffer

	// (Variable)
	fileComment?: string

	totalSize: number
}

const totalConstantsSize = 46

export async function parseCentralDirectoryHeader(
	sbuf: ISeekableBuffer,
	sbufOffset: number
): Promise<CentralDirectoryHeader> {
	let buf = await sbuf.read(sbufOffset, totalConstantsSize)
	let offset = 0

	const signature = buf.readUInt32LE(offset)
	offset += 4
	if (signature !== 0x02014b50) {
		throw new Error('An invalid signature!: 0x' + signature.toString(16))
	}

	// ゆるして
	const header: CentralDirectoryHeader = {} as CentralDirectoryHeader

	header.versionMadeBy = buf.subarray(offset, offset + 2)
	offset += 2

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

	const fileCommentLength = buf.readUInt16LE(offset)
	offset += 2

	header.diskNumberStart = buf.readUInt16LE(offset)
	offset += 2

	header.internalFileAttributes = buf.subarray(offset, offset + 2)
	offset += 2

	header.externalFileAttributes = buf.subarray(offset, offset + 4)
	offset += 4

	header.relativeOffsetOfLocalHeader = buf.readUInt32LE(offset)
	offset += 4

	const totalVariablesSize = fileNameLength + extraFieldLength + fileCommentLength
	buf = await sbuf.read(sbufOffset + offset, totalVariablesSize)
	offset = 0

	header.fileName = buf.toString('utf-8', offset, offset + fileNameLength)
	offset += fileNameLength

	if (extraFieldLength !== 0) {
		header.extraField = buf.subarray(offset, offset + extraFieldLength)
		offset += extraFieldLength
	}

	if (fileCommentLength !== 0) {
		header.fileComment = buf.toString('utf-8', offset, offset + fileCommentLength)
		offset += fileCommentLength
	}

	header.totalSize = totalConstantsSize + totalVariablesSize

	return header
}
