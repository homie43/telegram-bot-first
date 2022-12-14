const TelegramApi = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('./options');
const sequelize = require('./db');
const UserModel = require('./models');


const token = '5792836403:AAGTh1WQr796vgV35i3lLJVs6-SKJx-BdUY';

const bot = new TelegramApi(token, {polling: true});

const chats = {};


const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Сейчас я загадаю число от 0 до 9. А ты попробуй угадать!`);
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадай, какое число я загадал?', gameOptions);
}

const start = async () => {

    try {
        await sequelize.authenticate();
        await sequelize.sync();
    } catch (e) {
        console.log('Подключение к БД сломалось', e)
    }


    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветсвие'},
        {command: '/info', description: 'Информация о пользователе'},
        {command: '/game', description: 'Игра угадай цифру'}
    ]);
    
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        
        try {

            if (text === "/start") {
                // await UserModel.create({chatId});
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/7.webp');
                return bot.sendMessage(chatId, `Привет друг! Я первый бот, созданный homie43. Зайди в меню и выбери то, что ты хочешь!`);
            }
        
            if (text === "/info") {
                const user = await UserModel.findOne({chatId});
                return bot.sendMessage(chatId, `Тебя зовут ${msg.chat.first_name} ${msg.chat.last_name}. В игре у тебя правильных ответов: ${user.right}, а неправильных ${user.wrong}`);
            }
    
            if (text === "/game") {
                return startGame(chatId);
            }
    
            return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй еще раз!');

        } catch (e) {

            return bot.sendMessage(chatId, 'Произошла какая-то ошибка!');

        }
    });


    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if (data === '/again') {
            return startGame(chatId);
        }

        const user = await UserModel.findOne({chatId});
        if (data == chats[chatId]) {
            user.right += 1;
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/2.webp');
            await bot.sendMessage(chatId, `Ура! Ты угадал цифру ${chats[chatId]}`, againOptions);
        } else {
            user.wrong += 1;
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/3.webp');
            await bot.sendMessage(chatId, `Нет:( Цифра ${data} не подходит. Бот загадал цифру ${chats[chatId]}. Попробуй еще раз!`, againOptions);
        }
        await user.save();
    });
}

start();