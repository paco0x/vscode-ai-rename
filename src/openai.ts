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

export async function renameSymbol(
    apiKey: string,
    n: number,
    maxToken: number,
    temperature: number,
    codeText: string,
    pos: Position
) {
    const prompt = `I'll give a bunch of code in {[@@(CODE)@@]} format, CODE is the code text you needed. Rename the symbol at the ${pos.line} line, the ${pos.character} character in CODE, the new name should follow the naming convention of the programming language in the code, and should be based on the context of the code. The new name cannot be conflicted with other names in the context of the symbol. You only need to return the new name without any other string. {[@@(${codeText})@@]} `;

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
