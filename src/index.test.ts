import { ZipLoader } from './'
import { promises as fs } from 'fs'

function unreachable(): never {
	throw Error('This must never happen!')
}

describe('mascots.zip', () => {
	let loader: ZipLoader

	beforeAll(async () => {
		loader = await ZipLoader.fromFile('./testdata/mascots.zip')
		await loader.init()
	})

	afterAll(async () => {
		await loader.finalize()
	})

	test('すべてのファイルが存在するか', () => {
		const expectedFileNames = ['gopher.png', 'dlangkun.png'].sort()
		const fileNames = loader.entries.map((x) => x.fileName).sort()
		expect(fileNames).toEqual(expectedFileNames)
	})

	test('gopher.pngが期待したファイルかどうか', async () => {
		const entry = loader.entries.find((x) => x.fileName === 'gopher.png') ?? unreachable()

		const expected = await fs.readFile('./testdata/gopher.png')
		const content = await entry.getContentBuffer()

		expect(content.equals(expected)).toBeTruthy()
	})
})

describe('mascots-uncompressed.zip', () => {
	let loader: ZipLoader

	beforeAll(async () => {
		loader = await ZipLoader.fromFile('./testdata/mascots-uncompressed.zip')
		await loader.init()
	})

	afterAll(async () => {
		await loader.finalize()
	})

	test('すべてのファイルが存在するか', () => {
		const expectedFileNames = ['gopher.png', 'dlangkun.png'].sort()
		const fileNames = loader.entries.map((x) => x.fileName).sort()
		expect(fileNames).toEqual(expectedFileNames)
	})

	test('dlangkun.pngが期待したファイルかどうか', async () => {
		const entry = loader.entries.find((x) => x.fileName === 'dlangkun.png') ?? unreachable()

		const expected = await fs.readFile('./testdata/dlangkun.png')
		const content = await entry.getContentBuffer()

		expect(content.equals(expected)).toBeTruthy()
	})
})
