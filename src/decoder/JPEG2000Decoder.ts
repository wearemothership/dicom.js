import JpxImage from "./codecs/jpx";
import Decoder from "./Decoder";
import { getJpegData, fillBuffer } from "./util";

interface IJxTile {
	items: ArrayLike<number>
}
interface IJpxImage {
	tiles: Array<IJxTile>,
	componentsCount:number,
	parse(buffer:Uint8Array):void
}

class JPEG2000Decoder extends Decoder {
	private jpegs:Array<ArrayBuffer> | null = null

	protected decode(frameNo:number):Promise<Uint8Array | Uint16Array> {
		const { image } = this;
		const frameSize = image.rows
			* image.columns
			* image.bytesAllocated;

		if (!this.jpegs) {
			this.jpegs = getJpegData(image);
		}
		const decoder = <IJpxImage> (<unknown> new JpxImage());
		decoder.parse(new Uint8Array(this.jpegs[frameNo]));
		// const { width, height } = decoder;
		const decoded = decoder.tiles[frameNo].items;
		const numComponents = decoder.componentsCount;

		// TODO: why is this necessary?
		const decompressed = new DataView(new ArrayBuffer(frameSize * numComponents));
		fillBuffer(
			decoded,
			decompressed,
			0,
			image.bytesAllocated
		);

		return Promise.resolve(new Uint8Array(decompressed.buffer));
	}
}

export default JPEG2000Decoder;