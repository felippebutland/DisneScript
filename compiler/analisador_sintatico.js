const REGEX = {
  TYPES_DEFIN: "\\b(NUM|VIRNUM|PAL|SIMNAO)\\b",
  REP: "\\b(REP)\\b",
  ENQ: "\\b(ENQ)\\b",
  DUVIDA: "\\b(DUVIDA)\\b",
  IMPRIMIR: "\\b(IMPRIMIR)\\b",
  FUNCS_CAST: "\\b(PARAPAL|PARANUM|PARAVIRNUM|PARASIMNAO)\\b",
  OPER_COND: "(\\>=|\\<=|\\!=|=|<|>)",
  OPER_ARIT: "(\\+|\\-|\\*|\\/)",
  OPER_LOGIC: "(\\~|\\^|\\ˆ)",
  OPER_DEFIN: "¬\\s*\\bISTOEH\\b",
  ID: "\\b[a-zA-Z_][a-zA-Z0-9_]*\\b",
  VIRNUM: "[0-9][0-9]*,[0-9][0-9]*",
  NUM: "[0-9][0-9]*",
  PAL: "('([^']*)'|\"([^\"]*)\")",
  SIMNAO: "(\\bSIM\\b|\\bNAO\\b)",
  ",": "\\,",
  ";": "\\;",
  ":": "\\:",
  "(": "\\(",
  ")": "\\)",
  "«": "\\«",
  "»": "\\»"
};

const syntax_table = {
  MAIN: {
    ID: ["ID", "DECL", "MAIN"],
    ENQ: ["FUNCS_COND", "MAIN"],
    REP: ["FUNCS_COND", "MAIN"],
    DUVIDA: ["FUNCS_COND", "MAIN"],
    PARANUM: ["FUNCS_CAST", "MAIN"],
    PARAVIRNUM: ["FUNCS_CAST", "MAIN"],
    PARASIMNAO: ["FUNCS_CAST", "MAIN"],
    PARANUM: ["FUNCS_CAST", "MAIN"],
    IMPRIMIR: ["IMPRIMIR", "(", "VALUE", "MULTIPLE_PARAM", ")", ";", "MAIN"],
    ε: [],
  },
  DECL: {
    OPER_DEFIN: ["OPER_DEFIN", "TYPES_DEFIN", "ATRIB", ";"],
    ":": ["ATRIB", ";"],
  },
  ATRIB: {
    ":": [":", "VALUE"],
  },
  FUNCS_COND: {
    DUVIDA: ["DUVIDA", "(", "COND", ")", "«", "MAIN", "»"],
    REP: ["REP", "(", "COND", ")", "«", "MAIN", "»"],
    ENQ: ["ENQ", "(", "COND", ")", "«", "MAIN", "»"],
  },
  COND: {
    ID: ["VALUE", "OPER_COND", "VALUE", "MULTIPLE_COND"],
    NUM: ["VALUE", "OPER_COND", "VALUE", "MULTIPLE_COND"],
    VIRNUM: ["VALUE", "OPER_COND", "VALUE", "MULTIPLE_COND"],
    PAL: ["VALUE", "OPER_COND", "VALUE", "MULTIPLE_COND"],
    SIMNAO: ["VALUE", "OPER_COND", "VALUE", "MULTIPLE_COND"],
    ε: [],
  },
  VALUE: {
    ID: ["ID", "MULTIPLE_ARIT"],
    NUM: ["NUM", "MULTIPLE_ARIT"],
    VIRNUM: ["VIRNUM", "MULTIPLE_ARIT"],
    PAL: ["PAL", "MULTIPLE_ARIT"],
    SIMNAO: ["SIMNAO", "MULTIPLE_ARIT"],
    FUNCS_CAST: ["FUNCS_CAST", "(", "VALUE", ")"],
    "(": ["FUNC"],
  },
  FUNC: {
    "(": ["(", "VALUE", "MULTIPLE_PARAM", ")", "«", "MAIN", "»"],
  },
  OPER_COND: {
    ">": [">"],
    "<": ["<"],
    ">=": [">="],
    "<=": ["<="],
    "=": ["="],
  },
  OPER_LOGIC: {
    ˆ: ["ˆ"],
    "^": ["^"],
    "~": ["~"],
    ε: [],
  },
  OPER_ARIT: {
    "+": ["+"],
    "-": ["-"],
    "*": ["*"],
    "/": ["/"],
    ε: [],
  },
  MULTIPLE_ARIT: {
    OPER_ARIT: ["OPER_ARIT", "VALUE", "MULTIPLE_ARIT"],
    ε: [],
  },
  MULTIPLE_COND: {
    OPER_LOGIC: ["OPER_LOGIC", "COND", "MULTIPLE_COND"], // PARA CONDICOES MULTIPLAS
    ε: [],
  },
  MULTIPLE_PARAM: {
    ",": [",", "VALUE", "MULTIPLE_PARAM"], //PARA FUNCOES COM MULTIPLOS PARAMETROS
    ε: [],
  },
};

function tokenize(code) {
  const tokens = [];
  let position = 0;
  code = code.replace(/\s+/g, " ").replace(/\n/g, " ").replace(/\t/g, " ");
  while (position < code.length) {
    let matched = false;

    for (let tokenName in REGEX) {
      const pattern = new RegExp(`^${REGEX[tokenName]}`);
      const match = code.slice(position).match(pattern);

      if (match) {
        const value = match[0];
        tokens.push({ token: tokenName, value: value, position: position });
        position += value.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      position += 1;
    }
  }

  tokens.push({ token: "$", value: "$", position: code.length + 1 });
  return tokens;
}

function syntax_analyzer(token_list) {
  const stack = ["$", "MAIN"];
  let index = 0;

  while (stack.length > 0 || token_list.length < index) {
    const current_symbol = stack[stack.length - 1];
    const current_token = token_list[index];
    console.log(
      "Pilha:",
      stack,
      "\nSimbolo atual:",
      current_symbol,
      "\nSimbolo recebido: ",
      current_token.token,
      "Valor: ",
      current_token.value,
      "Posicao:",
      current_token.position,
      "\n"
    );

    if (current_symbol === current_token.token) {
      console.log("Encontrou o simbolo!");
      stack.pop();
      index += 1;
    } else if (current_symbol in syntax_table) {
      if (syntax_table[current_symbol].hasOwnProperty(current_token.token)) {
        const production = syntax_table[current_symbol][current_token.token];
        stack.pop();
        for (let i = production.length - 1; i >= 0; i--) {
          console.log("Adicionada a Pilha:", stack);
          stack.push(production[i]);
        }
      } else {
        if ("ε" in syntax_table[current_symbol]) {
          console.log("Caiu em Epson, recuperação\n");
          stack.pop();
        } else {
          console.log(
            "Error: Unexpected token",
            current_token.value,
            "Position: ",
            current_token.position
          );
          return false;
        }
      }
    } else {
      console.log("Error: Invalid symbol in the stack", current_symbol);
      return false;
    }
  }

  if (stack.length === 0) {
    console.log("\n\nEste código é válido!");
    return true;
  } else {
    console.log("Error: Syntax analysis failed.");
    return false;
  }
}

function main() {
  const file = './dml_language.disney';
  // with open(file, 'rb') as f:
  //     code = f.read().decode('utf-8')

  const code = `
        val1 ¬ ISTOEH NUM : 100;

        qtd ¬ ISTOEH NUM: 12;
        qtd2 ¬ ISTOEH NUM: 14;
        qtd3 ¬ ISTOEH VIRNUM: 12,5;
        qtd4 ¬ ISTOEH NUM: 12;
        qtd5 ¬ ISTOEH NUM: 12;
        qtd6 ¬ ISTOEH NUM: '12';

        ENQ (qtd >= 0) «

            func: (qtd1) «
                qtd: "Errou";
            »;

            DUVIDA ( val1 < 0 ^ val1 / qtd+1 > 0) «
                val1: val1 * qtd * 1;
                qtd: qtd - 1;
            »
            DUVIDA ( val1 = 0 + PARANUM(5) ) «
                qtd: "Errou";
            »
            DUVIDA (val1 > 0 ) «
                val1: PARAVIRNUM(val1/qtd);
                qtd: qtd - 1;
            »

            IMPRIMIR("QTD", qtd, "val1", val1);
        »
        
    `;

  const tokens = tokenize(code);
  syntax_analyzer(tokens);
}

main();

