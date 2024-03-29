import initWrittenWords, {
	LanguageOptions,
	Options,
	ValidNumber,
	toWords,
} from "written-numbers";
import wasm from "written-numbers/dist/wasm/written_numbers_wasm_bg.wasm?url";
import digit from "~/pomsky/digit.pom";

export type MessageData = {
	expression: ValidNumber;
	options: Options;
	languageOptions: LanguageOptions;
};

let didInit = false;
async function init() {
	if (!didInit) {
		console.time("Initialized WASM");
		await initWrittenWords(wasm);
		console.timeEnd("Initialized WASM");
		didInit = true;
	}
}

onmessage = async (message) => {
	await init();

	const { options, languageOptions }: MessageData = message.data;
	const expression = message.data.expression.toString();

	let evaluated: string;
	if (digit().test(expression)) {
		evaluated = expression;
	} else {
		try {
			evaluated = new Function("toWords", `return ${expression}`)(toWords);
		} catch (e) {
			postMessage(e.toString());
			return;
		}
	}

	try {
		console.log("Received number.");

		console.time("Converted to words");
		let words = toWords({
			number: evaluated,
			options,
			languageOptions,
		});
		console.timeEnd("Converted to words");

		console.log("Sent words.");
		postMessage(words);
	} catch (e) {
		if (e.message === "Invalid number format.") postMessage(evaluated);
		else postMessage(e.toString());
	}
};
