// import type { VercelRequest, VercelResponse } from "@vercel/node";
// import initWrittenWords, { toWords } from "written-numbers";

// @ts-ignore
import initWrittenWords, {
	to_words,
} from "written-numbers/dist/wasm/written_numbers_wasm.js";

declare type ValidNumber = string | bigint | number;
declare type Options = {
	language: "en" | "la" | string;
};
declare type LanguageOptions = Record<string, any>;

function toWords({
	number,
	options,
	languageOptions,
}: {
	number: ValidNumber;
	options?: Options;
	languageOptions?: LanguageOptions;
}): any {
	number ??= "";
	options ??= { language: "en" };
	languageOptions ??= {};
	const processedLanguageOptions = {};
	for (const [key, val] of Object.entries(languageOptions)) {
		processedLanguageOptions[snakeCase(key)] = val.toString();
	}
	return to_words(number.toString(), options, processedLanguageOptions);
}
function snakeCase(str) {
	return str.replace(/[A-Z]/g, (s) => `_${s.toLowerCase()}`);
}

let didInit = false;
async function init() {
	if (!didInit) {
		console.time("Initialized WASM");
		await initWrittenWords();
		console.timeEnd("Initialized WASM");
		didInit = true;
	}
}

export default async function (req, res) {
	res.setHeader("Cache-Control", "s-maxage=86400");

	await init();

	const { number } = JSON.parse(req.body);

	if (typeof number !== "string") {
		res.statusCode = 400;
		return res.send("number must be of type string");
	}

	const words = toWords({
		number,
	});

	res.send(words);
}
