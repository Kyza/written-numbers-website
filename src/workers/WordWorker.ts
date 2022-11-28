import {
	combineIllionParts,
	constants,
	getIllionPartNumbers,
	getIllionParts,
	hundreds,
	illions,
	illionWord,
	ones,
	tens,
	thousands,
	toOrdinal,
	toWords,
} from "written-numbers";
import { WordOptions } from "written-numbers/dist/toWords";

export type MessageData = WordOptions & {
	expression: string;
	ordinal: boolean;
};

onmessage = (message) => {
	const data: MessageData = message.data;

	const expression =
		message.data.expression.length > 0 ? message.data.expression : "0";

	let evaluated: string;
	if (/^\d+$/.test(expression)) {
		evaluated = expression;
	} else {
		evaluated = new Function(
			"toWords",
			"toOrdinal",
			"combineIllionParts",
			"constants",
			"getIllionPartNumbers",
			"getIllionParts",
			"hundreds",
			"illions",
			"illionWord",
			"ones",
			"tens",
			"thousands",
			`return ${expression}`
		)(
			toWords,
			toOrdinal,
			combineIllionParts,
			constants,
			getIllionPartNumbers,
			getIllionParts,
			hundreds,
			illions,
			illionWord,
			ones,
			tens,
			thousands
		);
	}

	try {
		let words = toWords(evaluated, data);

		if (data.ordinal) {
			words = toOrdinal(words);
		}

		postMessage(words);
	} catch (e) {
		if (e.message === "Invalid number format.") postMessage(evaluated);
		else throw e;
	}
};
