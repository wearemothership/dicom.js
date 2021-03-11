import fs from "fs";
import { parseImage } from ".";
import { shaFromJSON /* , toJSONString */ } from "../testUtils";

describe("parser tests", () => {
	const path = "./test/medical.nema.org/";

	const fileNameToTagHash = {
		"compsamples_j2k/IMAGES/J2KI/CT1_J2KI": "acfb98de0c52223a37b775cf04fd5a322be49d2c",
		"compsamples_j2k/IMAGES/J2KI/CT2_J2KI": "e5e6a8f176a079a9b3f2f280986f281d3dd69f24",
		"compsamples_j2k/IMAGES/J2KI/MG1_J2KI": "e6a5fdc3df2fa947fbacc537d097f40ef5eb584b",
		"compsamples_j2k/IMAGES/J2KI/MR1_J2KI": "4ba3b78cab39f8f5742ca828928c5c3af2ba035e",
		"compsamples_j2k/IMAGES/J2KI/MR2_J2KI": "d84d7725a09ad27a6b578f9878ba19a6e9c6a1f4",
		"compsamples_j2k/IMAGES/J2KI/MR3_J2KI": "51f5138b8df53eb4e27e7f00e004ce5989a68ca2",
		"compsamples_j2k/IMAGES/J2KI/MR4_J2KI": "fdff003984a79f8802f8f2509504f7bf8c4a7a6d",
		"compsamples_j2k/IMAGES/J2KI/NM1_J2KI": "199e3c6442f74569737945fc575a82d304919db6",
		"compsamples_j2k/IMAGES/J2KI/RG1_J2KI": "e96d1591e675854f59f785e4bdf4969f53c712e5",
		"compsamples_j2k/IMAGES/J2KI/RG2_J2KI": "1e2cc59612e94653e20a9706a284845f549c3c5e",
		"compsamples_j2k/IMAGES/J2KI/RG3_J2KI": "3d0bfedde3a2f08bd611f3a6acb78b37de1603c2",
		"compsamples_j2k/IMAGES/J2KI/SC1_J2KI": "530a809c98de979a87d4958de134e244891a4416",
		"compsamples_j2k/IMAGES/J2KI/US1_J2KI": "b671b62d0cc51789b3bb8367cea46340af8c54f6",
		"compsamples_j2k/IMAGES/J2KI/VL1_J2KI": "13fa4ad11121ec399aee5cfcf99d354d597abcaa",
		"compsamples_j2k/IMAGES/J2KI/VL2_J2KI": "2a5c5030d3450de0e2452ae58c0ed47a25fe3020",
		"compsamples_j2k/IMAGES/J2KI/VL3_J2KI": "4edd3b3b689c0c660437f2be45c2b1fed889f05b",
		"compsamples_j2k/IMAGES/J2KI/VL4_J2KI": "cc4bcfb18d6f68db501361e20ace94fda17dac3b",
		"compsamples_j2k/IMAGES/J2KI/VL5_J2KI": "8486cd73c952652dfb1f5b4a1190ef20521ceaaf",
		"compsamples_j2k/IMAGES/J2KI/VL6_J2KI": "ad75f53f4669dab9c3e65bab5a0204a5e2852283",
		"compsamples_j2k/IMAGES/J2KI/XA1_J2KI": "f5d2d39417b290cb6d1335730b959f206d5c2c51",
		"compsamples_j2k/IMAGES/J2KR/CT1_J2KR": "72c296fe5600bd1e184101c5b16e78d93f42bd8b",
		"compsamples_j2k/IMAGES/J2KR/CT2_J2KR": "726c108ce4bfafefb0c3720693d04fc355cf94c3",
		"compsamples_j2k/IMAGES/J2KR/MG1_J2KR": "5a971858ec90a7b5f9becb9c9dfd4c02bd58c996",
		"compsamples_j2k/IMAGES/J2KR/MR1_J2KR": "ce55e8fb5a1c86d83accd6202b743016cbfad3f2",
		"compsamples_j2k/IMAGES/J2KR/MR2_J2KR": "5eb19e84954959ed9fa767b8bd9cb105b02068cb",
		"compsamples_j2k/IMAGES/J2KR/MR3_J2KR": "d4d7b51708e684f42454eb4dc38b04ce3ff6f7ef",
		"compsamples_j2k/IMAGES/J2KR/MR4_J2KR": "ce53547a6fbece990c4e3bed070cfcdae176bbc2",
		"compsamples_j2k/IMAGES/J2KR/NM1_J2KR": "0508b14726be40afb4be47500a772f398ba44d5d",
		"compsamples_j2k/IMAGES/J2KR/RG1_J2KR": "407aed24169479c80cf243e0337efcca7f86c901",
		"compsamples_j2k/IMAGES/J2KR/RG2_J2KR": "d2b7b9029e61206883363343fe9046307c82972e",
		"compsamples_j2k/IMAGES/J2KR/RG3_J2KR": "18dcf57f523e0773194335216e7e1cd0cbccf6cd",
		"compsamples_j2k/IMAGES/J2KR/SC1_J2KR": "0eef8d8a4bb422033428443be53b97459afe5b30",
		"compsamples_j2k/IMAGES/J2KR/US1_J2KR": "d88807d39c5420037de916ec11e56e985795b8ac",
		"compsamples_j2k/IMAGES/J2KR/VL1_J2KR": "79c146e2c8fc8f7bb25c42f1711c73345bb0d158",
		"compsamples_j2k/IMAGES/J2KR/VL2_J2KR": "663bad473cfa467a2b6744cf3c4ce7b08992da4c",
		"compsamples_j2k/IMAGES/J2KR/VL3_J2KR": "7ec47a019de229ff7f28747596f22194064a69d7",
		"compsamples_j2k/IMAGES/J2KR/VL4_J2KR": "5370c70d4c51dcf4b1a41379ee75428e5d15191f",
		"compsamples_j2k/IMAGES/J2KR/VL5_J2KR": "eac6ca0f07336ecc8bba4f4f8c364a2dbca03959",
		"compsamples_j2k/IMAGES/J2KR/VL6_J2KR": "199078282aaff3f68240556428500bdff53e3f95",
		"compsamples_j2k/IMAGES/J2KR/XA1_J2KR": "a4224b313f22c1648f21be1246cd9ee3a04d1bb1",
		"compsamples_jpeg/IMAGES/JPLL/CT1_JPLL": "dbb274da0be4afd918ceed8ad0e5930099d6449c",
		"compsamples_jpeg/IMAGES/JPLL/CT2_JPLL": "b0c070fcae81d8df2f3b310c4c264c2f9819152c",
		"compsamples_jpeg/IMAGES/JPLL/MG1_JPLL": "7ef669020149c527fa4e0c6a83b9330129b1508d",
		"compsamples_jpeg/IMAGES/JPLL/MR1_JPLL": "a4329c20d1009e5c92a5e9d0bfb729e573bcb9e4",
		"compsamples_jpeg/IMAGES/JPLL/MR2_JPLL": "26a696626213c1e4679d6a99c850e49ad70b8f16",
		"compsamples_jpeg/IMAGES/JPLL/MR3_JPLL": "10037e9bb7fb1f0718fd6f52683dad334a37a4ac",
		"compsamples_jpeg/IMAGES/JPLL/MR4_JPLL": "e6a697b38b601f3ba95f8b60455fdbee90dc16f3",
		"compsamples_jpeg/IMAGES/JPLL/NM1_JPLL": "625a41834844eae907be75264b53dd9a32eec5b6",
		"compsamples_jpeg/IMAGES/JPLL/RG1_JPLL": "e6bbec12084943299746663cb4420cfc0a6cd237",
		"compsamples_jpeg/IMAGES/JPLL/RG2_JPLL": "c840e99a737b1404f205a53fe5f468cb740d620e",
		"compsamples_jpeg/IMAGES/JPLL/RG3_JPLL": "e0af83f1199e037cc248ebd7ca1f82ee7e41d0fd",
		"compsamples_jpeg/IMAGES/JPLL/SC1_JPLL": "438f381aa7ec8197654375a7291505443b4d53e6",
		"compsamples_jpeg/IMAGES/JPLL/XA1_JPLL": "88f820de80624d3173009bccd6ce969759ebf2ef",
		"compsamples_jpeg/IMAGES/JPLY/MG1_JPLY": "9601be2034dfcfc59ae404a821fbd027861b99a8",
		"compsamples_jpeg/IMAGES/JPLY/MR1_JPLY": "c604aba5c3e54cf68a0dca075135056cf03e5257",
		"compsamples_jpeg/IMAGES/JPLY/MR2_JPLY": "5c5d4afcf3f4d5e2417b44b3c844aafb2c813d4b",
		"compsamples_jpeg/IMAGES/JPLY/MR3_JPLY": "1fb187046a077ae5bc6a24768c5a2825c1c9a34c",
		"compsamples_jpeg/IMAGES/JPLY/MR4_JPLY": "03fa903d4709ca8dc5e6e90727605d8ea8cc10b5",
		"compsamples_jpeg/IMAGES/JPLY/NM1_JPLY": "44ef880d0a0e18970f660d461dc23164d4241bf7",
		"compsamples_jpeg/IMAGES/JPLY/RG2_JPLY": "7a2ed9f5ad3e2d08d1420f463b9a05e9f859f425",
		"compsamples_jpeg/IMAGES/JPLY/RG3_JPLY": "f85b4bffb97370e0010d9a87bd23ac9c1c7806a0",
		"compsamples_jpeg/IMAGES/JPLY/SC1_JPLY": "7402d6109f8536d87a5a888873a9f2605feb55ad",
		"compsamples_jpeg/IMAGES/JPLY/XA1_JPLY": "7f5c104ac32e12301ccdfe4fb7b5761f78f5f6b3",
		"compsamples_jpegls/IMAGES/JLSL/CT1_JLSL": "f37cfb430ab84498fea3e69775e90f105319faba",
		"compsamples_jpegls/IMAGES/JLSL/CT2_JLSL": "f814afdf8292c9723b92c9278990ac6b9e31e492",
		"compsamples_jpegls/IMAGES/JLSL/MG1_JLSL": "96d28a4a2b5ff2e0ad359f3be6b22a0bef2f4bd4",
		"compsamples_jpegls/IMAGES/JLSL/MR1_JLSL": "710a14d3d62910df5924c4f4853e54097a1fe263",
		"compsamples_jpegls/IMAGES/JLSL/MR2_JLSL": "a008d7fcb4620e9dfde69b9ddd66d5ed1261f6ae",
		"compsamples_jpegls/IMAGES/JLSL/MR3_JLSL": "57070e3b3e265e9983e8e464aaca92be24dc2c88",
		"compsamples_jpegls/IMAGES/JLSL/MR4_JLSL": "38aa1dc5fc17f590ef3e2cbd61a0d82732b417db",
		"compsamples_jpegls/IMAGES/JLSL/NM1_JLSL": "2982706e47ac2a4807c163c38d65c885339c9328",
		"compsamples_jpegls/IMAGES/JLSL/RG1_JLSL": "46104fd463c3404e2068d488edc1f5f877901b1e",
		"compsamples_jpegls/IMAGES/JLSL/RG2_JLSL": "fd4c7ba22a4713fa79c92f8c65e7b1b5cc49b9b4",
		"compsamples_jpegls/IMAGES/JLSL/RG3_JLSL": "ebfd075b785c4a54dd1a053c79f20fe638ce2ad6",
		"compsamples_jpegls/IMAGES/JLSL/SC1_JLSL": "07383bd850917802063f044c1b09d5c11556626a",
		"compsamples_jpegls/IMAGES/JLSL/XA1_JLSL": "44d6aa041c04f02365f84d25a7dd697984449c55",
		"compsamples_jpegls/IMAGES/JLSN/CT1_JLSN": "15b1ee190fda9e2a5634089cae44c41d5bf08846",
		"compsamples_jpegls/IMAGES/JLSN/CT2_JLSN": "1363821d2f0ec3dc11b1ad7d0ce94c50442e7551",
		"compsamples_jpegls/IMAGES/JLSN/MG1_JLSN": "c5898454ba21466e2e01e65f23ee61bc4f0798a8",
		"compsamples_jpegls/IMAGES/JLSN/MR1_JLSN": "4747d8cf7e9fe3eaa03b41ee74ef80374109f551",
		"compsamples_jpegls/IMAGES/JLSN/MR2_JLSN": "1c35488db48a0c8385e87458e7b90ac61e658aee",
		"compsamples_jpegls/IMAGES/JLSN/MR3_JLSN": "d9ec9db04bbc5083670c33b767094124c89178d4",
		"compsamples_jpegls/IMAGES/JLSN/MR4_JLSN": "4e72e3924c1969f3e67abcc5bcb9c13864edab83",
		"compsamples_jpegls/IMAGES/JLSN/NM1_JLSN": "ea19bcfc07497253c477179e23e0c5888f9543ba",
		"compsamples_jpegls/IMAGES/JLSN/RG1_JLSN": "2c29a14abad95b80126a0ab109a382f4a9aaf2fe",
		"compsamples_jpegls/IMAGES/JLSN/RG2_JLSN": "903fecaf4afba818489daaf8ebff4b42c0dc4038",
		"compsamples_jpegls/IMAGES/JLSN/RG3_JLSN": "0db0c3cf753b1ba54204d67ac59b9c48dab14b71",
		"compsamples_jpegls/IMAGES/JLSN/SC1_JLSN": "c7afcbcb1f13d1c7de7828ba784b6189baf27798",
		"compsamples_jpegls/IMAGES/JLSN/XA1_JLSN": "41a81e8ca83c8bad2b9d12b6ccbc05eeeb3c2273",
		"compsamples_refanddir/IMAGES/REF/CT1_UNC": "6feee818f0ed72488cadcc4ed0c3ba6d4639bf33",
		"compsamples_refanddir/IMAGES/REF/CT2_UNC": "c84de9287b9eb3b1ce977156d6face6fa7148598",
		"compsamples_refanddir/IMAGES/REF/MG1_UNC": "aa0e70bd9ddcdf2ecbb0f39681fd46220f0ec272",
		"compsamples_refanddir/IMAGES/REF/MR1_UNC": "75df9fb103216cfdb015fa965f6cf61d390cc322",
		"compsamples_refanddir/IMAGES/REF/MR2_UNC": "7e6c5f993392ec8390e5e3f324b60eaf8369bb59",
		"compsamples_refanddir/IMAGES/REF/MR3_UNC": "61c4eb233ab1c41c0a5710ca99481b38ff51a5a6",
		"compsamples_refanddir/IMAGES/REF/MR4_UNC": "d51fc37244f83f2b55d062e39fc69a4ee156a44e",
		"compsamples_refanddir/IMAGES/REF/NM1_UNC": "7f74e62b0e9c5dcbcd805503071fa02cc27a5197",
		"compsamples_refanddir/IMAGES/REF/RG1_UNC": "67eeb6b8cf1e7f90eddfa37562c2b17211478a57",
		"compsamples_refanddir/IMAGES/REF/RG2_UNC": "11508b16c6b0c50eab402a396b170b5a20873449",
		"compsamples_refanddir/IMAGES/REF/RG3_UNC": "2060e276e8f49b5d9aab4abb72f9ec1f8bfdf21a",
		"compsamples_refanddir/IMAGES/REF/SC1_UNC": "239cc4ae3dbe82dfd3058721fcfbe5d989c11a5a",
		"compsamples_refanddir/IMAGES/REF/US1_UNC": "494dfcae75123b4fa9eccd33f1fef22ec8f4a5d8",
		"compsamples_refanddir/IMAGES/REF/VL1_UNC": "aef54871cad3c11d1df0ad5ed1210df020a26d0b",
		"compsamples_refanddir/IMAGES/REF/VL2_UNC": "db5152409c03026220a1c29096b51b173f1268eb",
		"compsamples_refanddir/IMAGES/REF/VL3_UNC": "84dc8988b8d917cf501be20a4a3838f708edc98e",
		"compsamples_refanddir/IMAGES/REF/VL4_UNC": "9a92153f38f2b1128f5e0be43314e0c113f95667",
		"compsamples_refanddir/IMAGES/REF/VL5_UNC": "0cb12f0095158a390fbe2ebcd884deaa77370e08",
		"compsamples_refanddir/IMAGES/REF/VL6_UNC": "fd834198f30a791d52c4e738e6f16f58dd410b70",
		"compsamples_refanddir/IMAGES/REF/XA1_UNC": "42605acf71807304c43d5ea61fb090fb7eb675c9",
		"compsamples_rle_20040210/IMAGES/RLE/CT1_RLE": "e1348fb528cc8f2ab5b3189e377308c7b0a8a34a",
		"compsamples_rle_20040210/IMAGES/RLE/CT2_RLE": "60a1da4fb303a4af0a086ba7bdca0cd5d86474f1",
		"compsamples_rle_20040210/IMAGES/RLE/MG1_RLE": "0a625f25b9cceef2b324e71dee22590ab5f30446",
		"compsamples_rle_20040210/IMAGES/RLE/MR1_RLE": "0d27f5ef45782daca609bed9bc766cb841b3876e",
		"compsamples_rle_20040210/IMAGES/RLE/MR2_RLE": "8a6c2bfe4c8575771aca50dd4cd3eedd8f94db9a",
		"compsamples_rle_20040210/IMAGES/RLE/MR3_RLE": "c1ba114b9e1e471ce64ea34e9b99051a30045840",
		"compsamples_rle_20040210/IMAGES/RLE/MR4_RLE": "7064901773a109fac2f4c65a71b59e548e84e21f",
		"compsamples_rle_20040210/IMAGES/RLE/NM1_RLE": "6247066302030d0ec56acdd64c02fb386731d54e",
		"compsamples_rle_20040210/IMAGES/RLE/RG1_RLE": "c99d4ee9f967b6d265eeaed13bb095de752ed2e4",
		"compsamples_rle_20040210/IMAGES/RLE/RG2_RLE": "94e065b4f7096f1d11ce8411e798975a5d2db024",
		"compsamples_rle_20040210/IMAGES/RLE/RG3_RLE": "0fecc3b8c1d56ac338538f0b3a167eb6585523d7",
		"compsamples_rle_20040210/IMAGES/RLE/SC1_RLE": "84eef9e30582b65b6f61c0ba378fee291abafde9",
		"compsamples_rle_20040210/IMAGES/RLE/US1_RLE": "2b7a52b9c28cff568d2ed6a33a4f3fdc307a3231",
		"compsamples_rle_20040210/IMAGES/RLE/VL1_RLE": "9ce5db2740d357191a8aa66e1006e9fb31c8235b",
		"compsamples_rle_20040210/IMAGES/RLE/VL2_RLE": "1db6d6ca6213ab47a37df8727f87b89555a80bc8",
		"compsamples_rle_20040210/IMAGES/RLE/VL3_RLE": "10eb2a77f2a971a475aed25e4be0e3fae4c6d9e2",
		"compsamples_rle_20040210/IMAGES/RLE/VL4_RLE": "47feb9e52c8e7c3e78d454eaf9b028b051b3909a",
		"compsamples_rle_20040210/IMAGES/RLE/VL5_RLE": "00f37d2340fd84025ecf6ea1f07b61685eb9b6d4",
		"compsamples_rle_20040210/IMAGES/RLE/VL6_RLE": "2e9a2c9d25f4c20f09ad32450814579465948d73",
		"compsamples_rle_20040210/IMAGES/RLE/XA1_RLE": "ee093f9bfadff69d471294da129edb0b3f6342d6",
		"multiframe/DISCIMG/IMAGES/BRMULTI": "593d943be7ac48fee786dc5d5af0c737444b382b"
	};

	const fileKeys = Object.keys(fileNameToTagHash).sort();
	// let i = 0;
	fileKeys.forEach((key) => {
		it(`decodes RLE file ${key} OK`, () => {
			const data = fs.readFileSync(`${path}${key}`);
			const dataView = new DataView(new Uint8Array(data).buffer);
			const image = parseImage(dataView);
			expect(image).toBeTruthy();
			expect(image.tags).toBeTruthy();
			// console.log(toJSONString(image.tags));
			// fileNameToTagHash[key] = shaFromJSON(image.tags);
			expect(shaFromJSON(image.tags)).toEqual(fileNameToTagHash[key]);
			// i += 1;
			// if (i >= fileKeys.length) {
			// 	console.log(fileNameToTagHash);
			// }
		});
	});
});
