# Definindo funções

Para definir funções em DisneScript, temos alguns padrões:

- PARAPAL(): Função de cast para string, isto é, converte para "pal";
- PARANUM(): Função de cast para numérico, isto é, converte para "num";
- PARAVIRNUM(): Função de cast para ponto flutuante (float), isto é, converte para "virnum";
- PARASIMNAO(): Função de cast para booleano, isto é, converte para "simnao";
- ENQ(): Função de recursão;
- DUVIDA(): Operador lógico;
- IMPRIMIR(): Função para imprimir valor;

# Utilização

## PARAPAL()
```sh
variavel ¬ istoeh num: 9;
variavel ¬ istoeh pal: PARAPAL(variavel);
```

## PARANUM()
```sh
variavel ¬ istoeh pal: 9;
variavel ¬ istoeh num: PARANUM(variavel);
```

## PARAVIRNUM()
```sh
variavel ¬ istoeh pal: 9,9;
variavel ¬ istoeh num: PARAVIRNUM(variavel);
```

## PARASIMNAO()
```sh
variavel ¬ istoeh pal: true;
variavel ¬ istoeh num: PARASIMNAO(variavel);
```

## ENQ()

A única regra do 'enquanto' é que precisa ser comparado com algum valor, evitando loops infinitos

```sh
variavel ¬ istoeh num: 9;
qtd ¬ istoeh num: 5;
ENQ (qtd <= variavel ) «
  //your code here
»
```

## DUVIDA()

```sh
variavel ¬ istoeh pal: "teste";

DUVIDA ( variavel = "teste" ) «
  //your code here 
»

```

```sh
variavel ¬ istoeh pal: "teste";

DUVIDA ( val1 < 0 ^ val1 / qtd+1 > 0) «
  //your code here
»
```

## IMPRIMIR()

```sh
variavel ¬ istoeh pal: "teste";

IMPRIMIR (variavel)

```

```sh
variavel ¬ istoeh pal: "teste";

IMPRIMIR ("VAL1", variavel)

```