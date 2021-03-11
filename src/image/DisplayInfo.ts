import { IDecoderInfo } from "./DecoderInfo";
import DCMImage from "../parser/image";
import { TagIds } from "../parser/tag";

export interface IImageLutInfo {
	nEntries: number;
	firstValue: number;
	bitsStored: number;
	data: Uint8Array | Uint16Array
}

export interface IDisplayInfo extends IDecoderInfo {

	nFrames: number

	lut: IImageLutInfo | null

	invert: boolean

	minPixVal: number | null
	maxPixVal: number | null

	windowCenter: number | null
	windowWidth: number | null

	slope: number
	intercept: number
}

export const lutInfoFromImage = (image: DCMImage): IImageLutInfo | null => {
	const lutDescriptor = image.getTagValue(TagIds.VoiLutDescriptor) as number[];
	if (lutDescriptor?.length !== 3) {
		return null;
	}
	const [nEntries, firstValue, bitsStored] = lutDescriptor;
	if (nEntries === 0 || nEntries >= 2 ** bitsStored - 1) {
		return null;
	}
	let ArrayType: Uint8ArrayConstructor | Uint16ArrayConstructor = Uint8Array;
	if (bitsStored > 8) {
		ArrayType = Uint16Array;
	}
	const lutDataTagValue = image.getTagValue(TagIds.VoiLutData) as Uint8Array | Uint16Array;
	if (!lutDataTagValue) {
		return null;
	}
	const data = new ArrayType(
		lutDataTagValue,
		0,
		Math.min(lutDescriptor[0] || 2 ** 16, lutDataTagValue.length)
	);

	return {
		nEntries,
		firstValue,
		bitsStored,
		data
	};
};

export const displayInfoFromDecoderInfo = (info:IDecoderInfo): IDisplayInfo => {
	const { image } = info;
	let invert = image.getTagValueIndexed(TagIds.LutShape) === "inverse";
	invert = invert || image.photometricInterpretation === "MONOCHROME1";

	const displayInfo: IDisplayInfo = {
		...info,

		nFrames: image.numberOfFrames || 1,

		lut: lutInfoFromImage(info.image),

		minPixVal: image.imageMin,
		maxPixVal: image.imageMax,

		windowCenter: image.windowCenter,
		windowWidth: image.windowWidth,

		slope: image.dataScaleSlope || 1.0,
		intercept: image.dataScaleIntercept || 0.0,

		invert
	};
	return displayInfo;
};
