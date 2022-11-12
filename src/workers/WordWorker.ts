import { toOrdinal, toWords } from "written-numbers/src/index";
import { WordOptions } from "written-numbers/src/toWords";

export type MessageData = WordOptions & {
	expression: string;
	ordinal: boolean;
};

onmessage = (message) => {
	const data: MessageData = message.data;
	console.log("data", data);

	const expression =
		message.data.expression.length > 0 ? message.data.expression : "0";

	let evaluated;
	if (/^\d+$/.test(expression)) {
		evaluated = expression;
	} else {
		evaluated = new Function(
			"toWords",
			"toOrdinal",
			`return ${expression}`
		)(toWords, toOrdinal);
	}
	console.log(evaluated);

	let words = toWords(evaluated, data);
	console.log(words);

	if (data.ordinal) {
		words = toOrdinal(words);
	}

	postMessage(words);
};
