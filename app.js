// Configurações do Firebase:
const firebaseConfig = {
    apiKey: "AIzaSyDLWClGJbn8hdugrjDN7-uy5ZGtdZPwuRI",
    authDomain: "siq-2-0.firebaseapp.com",
    databaseURL: "https://siq-2-0-default-rtdb.firebaseio.com",
    projectId: "siq-2-0",
    storageBucket: "siq-2-0.appspot.com",
    messagingSenderId: "787300245311",
    appId: "1:787300245311:web:430fdbf45e350c64337d8a",
    measurementId: "G-R4R52ESNN7"
};

//teste de commit computador WEG

// Inicializando o Firebase:
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Criando lista de produtos inspecionados:
let produtosInspecionados = [];

//Formatar a data para apresentar no formato dd/mm/aaaa:
function formatarData(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); // Meses começam em 0
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// Referência ao documento que armazena o último ID para ordenar ID's:
const counterRef = firebase.firestore().collection('counters').doc('productsCounter');

// Função assíncrona (aguarda resposta da database para continuar) para adicionar um novo produto com um ID progressivo:
async function addProduct(data) {
  try {
    // Obter o último ID usado:
    const counterDoc = await counterRef.get();

    let newId = 1; // Inicia o ID como 1 se for o primeiro registro:

    if (counterDoc.exists) {
      newId = counterDoc.data().lastId + 1; // Incrementa o último ID
    }

    // Adicionar o novo produto ao banco de dados com o ID incrementado
    await firebase.firestore().collection('produtos').doc(String(newId)).set(data);

    // Atualizar o campo 'lastId' com o novo ID gerado
    await counterRef.set({ lastId: newId });

    console.log('Produto adicionado com sucesso com o ID:', newId);
  } catch (error) {
    console.error('Erro ao adicionar produto: ', error);
  }
}

// Função para enviar os dados
function enviar() {
  
    // Registra a data e hora atuais
    let data = new Date();
    console.log("Data e hora registradas:", data);

    // Coletando informações dos campos:
    let inversor = document.getElementById("produto_inversor").value;
    let serial = document.getElementById("numero_serie").value;
    let material = document.getElementById("material").value;
    let descricao = document.getElementById("descricao").value;
    let ordem = document.getElementById("ordem").value;
    let inspetor = document.getElementById("inspetor").value;
    let resultado = document.getElementById("resultado").value;

    console.log('Valores coletados:\n');
    console.log(`Inversor: ${inversor}`);
    console.log(`Serial: ${serial}`);
    console.log(`Material: ${material}`);
    console.log(`Descrição: ${descricao}`);
    console.log(`Ordem: ${ordem}`);
    console.log(`Data: ${data}`);
    console.log(`Inspetor: ${inspetor}`);
    console.log(`Resultado: ${resultado}`);

    // Criando objeto:
    let produto = {
        inversor,
        serial,
        material,
        descricao,
        ordem,
        data: formatarData(data),
        inspetor,
        resultado
    };

    // Chama a função para adicionar o produto com ID progressivo
    addProduct(produto)
        .then(() => {
            console.log("Produto enviado com sucesso.");
            // carregarProdutos(); // Atualiza a tabela após o envio

            // Limpar os campos do formulário
            document.getElementById("produto_inversor").value = "";
            document.getElementById("numero_serie").value = "";
            document.getElementById("material").value = "";
            document.getElementById("descricao").value = "";
            document.getElementById("ordem").value = "";
            document.getElementById("inspetor").value = "";
            document.getElementById("resultado").value = "";

            alert("Dados enviados com sucesso.");
        })
        .catch(error => console.error("Erro ao enviar produto: ", error));
}

// Função assíncrona para baixar o Excel:
async function baixar() {
    try {
        // Consultar os produtos diretamente do Firestore
        const snapshot = await db.collection('produtos').orderBy('data', 'desc').get();

        // Criar uma nova matriz com os dados na ordem desejada
        const produtosFormatados = snapshot.docs.map(doc => ({
            id: doc.id,                // ID
            data: doc.data().data,      // Data
            inversor: doc.data().inversor,  // Inversor
            serial: doc.data().serial,  // Serial
            material: doc.data().material,  // Material
            descricao: doc.data().descricao,  // Descrição
            ordem: doc.data().ordem,  // Ordem
            inspetor: doc.data().inspetor,  // Inspetor
            resultado: doc.data().resultado  // Resultado
        }));

        // Criar uma planilha com a ordem especificada
        const ws = XLSX.utils.json_to_sheet(produtosFormatados);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Produtos");

        // Gerar o arquivo e iniciar o download
        XLSX.writeFile(wb, "produtos.xlsx");
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

//Próximo passo: ordenar por ID