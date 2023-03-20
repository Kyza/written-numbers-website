// import type { VercelRequest, VercelResponse } from "@vercel/node";
import initWrittenWords, { toWords } from "written-numbers";

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
