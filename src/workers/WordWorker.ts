import { toOrdinal, toWords } from "written-numbers/src/index";
import { WordOptions } from "written-numbers/src/toWords";

onmessage = (message) => {
	const { data } = message;
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

	const words = toWords(evaluated, data as WordOptions);
	console.log(words);

	postMessage(words);
};
