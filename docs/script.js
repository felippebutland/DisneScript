window.onload = function() {
  // Get references to HTML elements
  let codeInput = document.getElementById('code-input');
  let runButton = document.getElementById('run-button');
  let output = document.getElementById('output');

  let savedCode = localStorage.getItem('savedCode');

  if (savedCode) {
      codeInput.value = savedCode;
  }

  codeInput.addEventListener('input', function() {
      let currentCode = codeInput.value;
      localStorage.setItem('savedCode', currentCode);
  });

  let currentRoute = window.location.href.split('/').reverse()[0];

  setTimeout(function() {
    if(codeInput.value === "") {
      window.location.reload();
    } else {
      console.log("Nada");
    }

  }, 3000)

  if (currentRoute === "HOME") {
    codeInput.style.display = "block";
    runButton.style.display = "block";
    output.style.display = "block";
  } else {
    codeInput.style.display = "none";
    runButton.style.display = "none";
    output.style.display = "none";
  }

  // Add click event listener to the run button
  runButton.addEventListener('click', function() {
      // Clear the output
      output.innerHTML = '';
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
                  return {
                    values: {
                      "Error: Unexpected token":
                      current_token.value,
                      "Position: ":
                      current_token.position
                    },
                    false: false,
                  }
                }
              }
            } else {
              return {
                values: {
                  "Error: Invalid symbol in the stack": current_symbol
                },
                false: false,
              }
            }
          }
        
          if (stack.length === 0) {
            console.log("\n\nEste código é válido!");
            return {
              values: {
                values: stack,
              },
              true: true
            }
          } else {
            return {
              values: {
                Error: "Error: Syntax analysis failed."
              },
              false: false,
            }
          }
        }
        
        function main() {
        
          const code = codeInput.value
        
          const tokens = tokenize(code);
          const syntax = syntax_analyzer(tokens);

          const syntaxAnalyzer = JSON.stringify(syntax.values);

          if(syntax.true){
            output.innerHTML = "Este código é válido!"
          } else {
            output.innerHTML = syntaxAnalyzer.replace("{", "").replace("}", "").replace(/,/g, "<br>").replace(/"/g, "");
          }
        }
        
        main();
  });

    
};