import fetch from "node-fetch";
import { Position } from "vscode";

interface Choice {
    text: string;
}

interface Error {
    code: string;
    message: string;
    type: string;
    param: string | null;
}

interface Response {
    error: Error;
    choices: Array<Choice>;
}

export async function getRenameSuggestions(
    apiKey: string,
    n: number,
    maxToken: number,
    temperature: number,
    codeText: string,
    symbol: string,
    pos: Position
) {
    const prompt = `I'll give a bunch of code in {[@@(CODE)@@]} format, CODE is the code text you needed. Rename the symbol at the ${pos.line} line, the ${pos.character} character in CODE, the original name is ${symbol}. The new name should follow the naming convention of the programming language, and should be a meaningful name based on the context of the code. The new name cannot be conflicted with other names in the scope of the symbol and should be different from the original name. You only need to return the new name without any other word. {[@@(${codeText})@@]}`;

    const payload = {
        model: "text-davinci-003",
        prompt,
        n,
        temperature: temperature,
        max_tokens: maxToken,
        stream: false,
    };
    const data = await fetch("https://api.openai.com/v1/completions", {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        method: "POST",
        body: JSON.stringify(payload),
    });

    const response: Response = await data.json();
    if (response.error) {
        throw new Error(JSON.stringify(response.error));
    }

    const choices = response.choices.reduce((prev, cur) => {
        const choice = cur.text.replace(/(\r\n|\n|\r)/gm, "");
        return prev.add(choice);
    }, new Set<string>());

    return choices;
}
