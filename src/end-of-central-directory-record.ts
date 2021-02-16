import { ISeekableBuffer } from './seekable-buffer'

export type EndOfCentralDirectoryRecord = {
	// (4 bytes)
	// endOfCentralDirSignature: 0x06054b50

	// (2 bytes)
	numberOfThisDisk: number

	// (2 bytes)
	numberOfTheDiskWithTheStartOfTheCentralDirectory: number

	// (2 bytes)
	totalNumberOfEntriesInTheCentralDirectoryOnThisDisk: number

	// (2 bytes)
	totalNumberOfEntriesInTheCentralDirectory: number

	// (4 bytes)
	sizeOfCentralDirectory: number

	// (4 bytes)
	offsetOfStartOfCentralDirectoryWithRespectToTheStartingDiskNumber: number

	// (2 bytes)
	// dotZipFileCommentLength: number

	// (Variable)
	dotZipFileComment?: string
}

const signature = Buffer.from([0x50, 0x4b, 0x05, 0x06])
const totalConstantsSize = 22

async function findSignature(sbuf: ISeekableBuffer): Promise<number> {
	for (let start = sbuf.length() - totalConstantsSize; 0 <= start; start--) {
		const buf = await sbuf.read(start, 4)
		if (buf.equals(signature)) {
			return sbuf.length() - totalConstantsSize
		}
	}

	throw new Error('Unable to find the end of central directory record signature!')
}

export async function parseEndOfCentralDirectoryRecord(
	sbuf: ISeekableBuffer
): Promise<EndOfCentralDirectoryRecord> {
	const startOffset = (await findSignature(sbuf)) + 4
	const buf = await sbuf.read(startOffset, sbuf.length() - startOffset)

	let offset = 0

	// ゆるして
	const record: EndOfCentralDirectoryRecord = {} as EndOfCentralDirectoryRecord

	record.numberOfThisDisk = buf.readUInt16LE(offset)
	offset += 2

	record.numberOfTheDiskWithTheStartOfTheCentralDirectory = buf.readUInt16LE(offset)
	offset += 2

	record.totalNumberOfEntriesInTheCentralDirectoryOnThisDisk = buf.readUInt16LE(offset)
	offset += 2

	record.totalNumberOfEntriesInTheCentralDirectory = buf.readUInt16LE(offset)
	offset += 2

	record.sizeOfCentralDirectory = buf.readUInt32LE(offset)
	offset += 4

	record.offsetOfStartOfCentralDirectoryWithRespectToTheStartingDiskNumber = buf.readUInt32LE(
		offset
	)
	offset += 4

	const commentLength = buf.readUInt16LE(offset)
	offset += 2

	if (commentLength !== 0) {
		record.dotZipFileComment = buf.toString('utf-8', offset, offset + commentLength)
	}
	offset += commentLength

	return record
}
