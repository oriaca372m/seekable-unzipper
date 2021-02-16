# seekable-unzipper
zipファイル全体をメモリに読み込まずにファイルを展開できるライブラリ

基本的なzipファイルにしか対応していない

# 使い方
``` typescript
import { ZipLoader } from '@oriaca372m/seekable-unzipper'

async function main() {
	const loader = await ZipLoader.fromFile('data.zip')
	// loaderを使う準備
	// この時点ではファイルリストのみ読み込む
	await loader.init()

	for (const entry of loader.entries) {
		// ファイル名の表示
		console.log(entry.fileName)

		// ファイルを展開してBufferで返す
		// この段階でメモリにファイル内容を読み込む
		const buffer = await entry.getContentBuffer()

		// ReadableStreamとして受け取ることもできる
		const stream = entry.getContentStream()
	}

	// 後処理
	await loader.finalize()
}
```
