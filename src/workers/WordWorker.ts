import { toWords } from "written-numbers/src/index";

onmessage = (message) => {
	const expression = message.data.length > 0 ? message.data : "0";

	let evaluated;
	if (/^\d+$/.test(expression)) {
		evaluated = expression;
	} else {
		evaluated = new Function(`return ${expression}`)();
	}
	console.log(evaluated);

	const words = toWords(evaluated);
	console.log(words);

	postMessage(words);
};
