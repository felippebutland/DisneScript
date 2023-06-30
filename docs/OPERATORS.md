# Operadores Artimétricos 

Os operadores aritimétricos em DisneScript, são muito fáceis de gravar e estar utilizando:

- ```+```: soma um valor;
- ```-```: subtrai um valor;
- ```*```: multiplica um valor;
- ```/```: divide um valor;
- ```=```: operação de comparação (igual que);
- ```<```: operação de comparação (menor que);
- ```>``` : operação de comparação (maior que);
- ```~```: operação de negação;
- ```^```: operação de comparação E (and);
- ```ˆ```: operação de comparação OU (OR);
- ```:```: operação de atribuição;
- ```¬```: operação de tipagem (definir tipos);
- ```"```: delimitação de string;
- ```«```: abrir escopo;
- ```»```: fechar escopo;

## Exemplos:

```sh
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
    DUVIDA ( val1 = 0 + 5 ) «
      qtd: "Errou";
    »
    DUVIDA (val1 > 0 ) «
      val1: val1/qtd;
      qtd: qtd - 1;
    »

    IMPRIMIR("QTD", qtd, "val1", val1);
»

```

