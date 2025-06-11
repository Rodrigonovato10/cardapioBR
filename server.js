// server.js - Backend para o Cardápio Digital e Gestão de Pedidos
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // Para gerar IDs únicos para itens e pedidos

const app = express();
const PORT = 3000;

// Middleware para permitir requisições de diferentes origens (CORS)
app.use(cors());
// Middleware para parsear o corpo das requisições como JSON
app.use(express.json());

// --- Dados em memória (simulando um banco de dados) ---
// Em uma aplicação real, você usaria um banco de dados como MongoDB, PostgreSQL, etc.

let menuItems = {
    'lanches': [
        { id: uuidv4(), name: 'X-Burger', description: 'Hambúrguer de carne com queijo e salada.', price: 25.00, imageUrl: 'https://placehold.co/300x200/FBBF24/333333?text=X-Burger' },
        { id: uuidv4(), name: 'X-Salada', description: 'Hambúrguer de carne com queijo, alface, tomate e maionese.', price: 28.00, imageUrl: 'https://placehold.co/300x200/FBBF24/333333?text=X-Salada' },
        { id: uuidv4(), name: 'X-Bacon', description: 'Hambúrguer de carne com queijo, bacon crocante e maionese.', price: 32.00, imageUrl: 'https://placehold.co/300x200/FBBF24/333333?text=X-Bacon' },
        { id: uuidv4(), name: 'X-Frango', description: 'Hambúrguer de frango desfiado com catupiry e alface.', price: 29.50, imageUrl: 'https://placehold.co/300x200/FBBF24/333333?text=X-Frango' },
        { id: uuidv4(), name: 'X-Tudo', description: 'Hambúrguer completo com carne, queijo, bacon, ovo, presunto, alface e tomate.', price: 38.00, imageUrl: 'https://placehold.co/300x200/FBBF24/333333?text=X-Tudo' }
    ],
    'bebidas': [
        { id: uuidv4(), name: 'Coca-Cola Lata', description: 'Refrigerante 350ml.', price: 7.00, imageUrl: 'https://placehold.co/300x200/FBBF24/333333?text=Coca-Cola' },
        { id: uuidv4(), name: 'Suco de Laranja', description: 'Suco natural de laranja 300ml.', price: 10.00, imageUrl: 'https://placehold.co/300x200/FBBF24/333333?text=Suco' },
        { id: uuidv4(), name: 'Água Mineral', description: 'Água mineral sem gás 500ml.', price: 5.00, imageUrl: 'https://placehold.co/300x200/FBBF24/333333?text=Agua' },
        { id: uuidv4(), name: 'Guaraná Antarctica', description: 'Refrigerante Guaraná Antarctica 350ml.', price: 6.50, imageUrl: 'https://placehold.co/300x200/FBBF24/333333?text=Guarana' }
    ],
    'porcoes': [
        { id: uuidv4(), name: 'Batata Frita', description: 'Porção de batatas fritas crocantes.', price: 18.00, imageUrl: 'https://placehold.co/300x200/FBBF24/333333?text=Batata' },
        { id: uuidv4(), name: 'Onion Rings', description: 'Anéis de cebola empanados.', price: 22.00, imageUrl: 'https://placehold.co/300x200/FBBF24/333333?text=Onion+Rings' },
        { id: uuidv4(), name: 'Mandioca Frita', description: 'Porção de mandioca frita com queijo ralado.', price: 20.00, imageUrl: 'https://placehold.co/300x200/FBBF24/333333?text=Mandioca' }
    ],
    'sobremesas': [ // Nova Categoria de Exemplo
        { id: uuidv4(), name: 'Pudim de Leite', description: 'Delicioso pudim de leite condensado.', price: 15.00, imageUrl: 'https://placehold.co/300x200/FBBF24/333333?text=Pudim' },
        { id: uuidv4(), name: 'Brownie com Sorvete', description: 'Brownie quente com uma bola de sorvete de creme.', price: 20.00, imageUrl: 'https://placehold.co/300x200/FBBF24/333333?text=Brownie' }
    ]
};

let footerData = {
    contacts: {
        phone: '(XX) XXXX-XXXX',
        email: 'contato@saborarte.com',
        address: 'Rua Principal, 123 - Centro, Cidade - Estado'
    },
    operatingHours: 'Segunda a Sexta: 11h - 23h\nSábado e Domingo: 12h - 00h',
    copyright: '© 2024 Restaurante Sabor & Arte. Todos os direitos reservados.',
    message: 'Agradecemos a preferência! Volte sempre!'
};

let orders = []; // Array para armazenar os pedidos

// --- Rotas da API ---

// Rota para obter itens do menu
app.get('/api/menu-items', (req, res) => {
    res.json(menuItems);
});

// Rota para adicionar/atualizar itens do menu (ADMIN)
app.post('/api/menu-items', (req, res) => {
    const { category, item } = req.body;
    if (!category || !item || !item.name || !item.price || !item.description) {
        return res.status(400).json({ message: 'Dados do item incompletos.' });
    }

    // Garante que a categoria exista
    if (!menuItems[category]) {
        menuItems[category] = [];
    }

    // Se o item já tem um ID, tenta atualizá-lo
    if (item.id) {
        const index = menuItems[category].findIndex(i => i.id === item.id);
        if (index !== -1) {
            menuItems[category][index] = { ...menuItems[category][index], ...item };
            return res.status(200).json({ message: 'Item atualizado com sucesso!', item: menuItems[category][index] });
        }
    }

    // Se não tem ID ou não encontrou para atualizar, adiciona como novo
    const newItem = { id: uuidv4(), ...item };
    menuItems[category].push(newItem);
    res.status(201).json({ message: 'Item adicionado com sucesso!', item: newItem });
});

// Rota para deletar um item do menu (ADMIN)
app.delete('/api/menu-items/:categoryId/:itemId', (req, res) => {
    const { categoryId, itemId } = req.params;
    if (!menuItems[categoryId]) {
        return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    const initialLength = menuItems[categoryId].length;
    menuItems[categoryId] = menuItems[categoryId].filter(item => item.id !== itemId);
    if (menuItems[categoryId].length < initialLength) {
        res.status(200).json({ message: 'Item removido com sucesso.' });
    } else {
        res.status(404).json({ message: 'Item não encontrado na categoria especificada.' });
    }
});

// Rota para obter dados do rodapé
app.get('/api/footer', (req, res) => {
    res.json(footerData);
});

// Rota para atualizar dados do rodapé (ADMIN)
app.put('/api/footer', (req, res) => {
    const { contacts, operatingHours, copyright, message } = req.body;
    if (contacts) footerData.contacts = { ...footerData.contacts, ...contacts };
    if (operatingHours !== undefined) footerData.operatingHours = operatingHours;
    if (copyright !== undefined) footerData.copyright = copyright;
    if (message !== undefined) footerData.message = message;
    res.status(200).json({ message: 'Dados do rodapé atualizados com sucesso!', footer: footerData });
});

// --- Rotas de Pedidos ---

// Rota para obter todos os pedidos
app.get('/api/orders', (req, res) => {
    // Retorna os pedidos ordenados do mais novo para o mais antigo
    const sortedOrders = [...orders].sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
    res.json(sortedOrders);
});

// Rota para criar um novo pedido
app.post('/api/orders', (req, res) => {
    const { customerName, items, total, orderType, tableNumber, deliveryAddress, paymentMethod, notes, status } = req.body;

    if (!customerName || !items || items.length === 0 || total === undefined || !orderType || !paymentMethod) {
        return res.status(400).json({ message: 'Dados do pedido incompletos.' });
    }

    const newOrder = {
        id: uuidv4(),
        customerName,
        items,
        total,
        orderType,
        tableNumber: orderType === 'mesa' ? tableNumber : null,
        deliveryAddress: orderType === 'entrega' ? deliveryAddress : null, // Assuming 'entrega' type for delivery
        paymentMethod,
        notes,
        orderTime: new Date().toISOString(), // Data e hora do pedido
        status: status || 'pending', // 'pending', 'awaiting-payment', 'in-progress', 'finished', 'cancelled'
        finishTime: null // Para quando o pedido for finalizado
    };

    orders.push(newOrder);
    res.status(201).json({ message: 'Pedido criado com sucesso!', order: newOrder });
});

// Rota para atualizar o status de um pedido (ADMIN)
app.patch('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { newStatus } = req.body;

    if (!newStatus) {
        return res.status(400).json({ message: 'Novo status não fornecido.' });
    }

    const orderIndex = orders.findIndex(order => order.id === id);

    if (orderIndex === -1) {
        return res.status(404).json({ message: 'Pedido não encontrado.' });
    }

    // Lógica para transições de status
    // Você pode adicionar regras mais complexas aqui (ex: só pode ir de 'pending' para 'in-progress')
    orders[orderIndex].status = newStatus;
    
    // Se o status for 'finished', registra a hora de finalização
    if (newStatus === 'finished') {
        orders[orderIndex].finishTime = new Date().toISOString();
    } else {
        orders[orderIndex].finishTime = null; // Reseta se o status mudar para algo diferente de finished
    }

    res.status(200).json({ message: `Status do pedido ${id} atualizado para ${newStatus}.`, order: orders[orderIndex] });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
