import { toOrdinal, toWords } from "written-numbers/src/index";
import { WordOptions } from "written-numbers/src/toWords";

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
			`return ${expression}`
		)(toWords, toOrdinal);
	}

	let words = toWords(evaluated, data);

	if (data.ordinal) {
		words = toOrdinal(words);
	}

	postMessage(words);
};
