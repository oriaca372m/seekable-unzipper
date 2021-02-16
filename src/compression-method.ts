export type CompressionMethod =
	| 'no-compression'
	| 'shrunk'
	| 'compression-factor-1'
	| 'compression-factor-2'
	| 'compression-factor-3'
	| 'compression-factor-4'
	| 'implode'
	| 'deflate'
	| 'deflate64'
	| 'old-ibm-terse'
	| 'bzip2'
	| 'lzma'
	| 'z-os-cmpsc'
	| 'new-ibm-terse'
	| 'lz77'
	| 'zstd'
	| 'mp3'
	| 'xz'
	| 'jpeg'
	| 'wav-pack'
	| 'ppmd'
	| 'encryption-marker'
	| 'unknown'

const map: { [key: number]: CompressionMethod } = {
	0: 'no-compression',
	1: 'shrunk',
	2: 'compression-factor-1',
	3: 'compression-factor-2',
	4: 'compression-factor-3',
	5: 'compression-factor-4',
	6: 'implode',
	8: 'deflate',
	9: 'deflate64',
	10: 'old-ibm-terse',
	12: 'bzip2',
	14: 'lzma',
	16: 'z-os-cmpsc',
	18: 'new-ibm-terse',
	19: 'lz77',
	20: 'zstd',
	93: 'zstd',
	94: 'mp3',
	95: 'xz',
	96: 'jpeg',
	97: 'wav-pack',
	98: 'ppmd',
	99: 'encryption-marker',
}

export function parseCompressionMethod(nb: number): CompressionMethod {
	return map[nb] ?? 'unknown'
}
