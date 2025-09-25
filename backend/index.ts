import { Telegraf, Markup} from "telegraf"
import {PrismaClient} from "./generated/prisma"
import { Keypair, Connection } from "@solana/web3.js"
import { getBalanceMessage } from "./solana"

const token = process.env.TELEGRAM_BOT
const client = new  PrismaClient()
const bot = new Telegraf(token!)
const connection = new Connection(process.env.RPC_ENDPOINT!)


// defaut button, it will appears like button so user can select one of these button
const DEFAULT_BUTTON = Markup.inlineKeyboard([
    Markup.button.callback("Show public key","public_key"), // first agrs appears on the ui second one is key(what will happen when button is clicked)
    Markup.button.callback("Show private key","private_key")
])
bot.start(async(ctx )=>{

    // check the user is already exist or not 
    const user = await client.user.findFirst({
        where:{
            tgUserId : ctx.chat.id.toString()
        }
    })


    // if exist 
    if(user){
        const publicKey = user.publicKey
        const {empty, message} =await getBalanceMessage(publicKey)
        ctx.reply(`Welcome back to nobita bot. Here is your public key ${publicKey}, You can trade on solana now. ${empty ? "Your wallet is empty please fund it to trade on sol" : message}`,{
            ...DEFAULT_BUTTON
        })
    }else{ // if not
        const keypair = Keypair.generate() // generate the keypair and create the user and put the public/private key 
        const publicKey = keypair.publicKey
        const privateKey = keypair.secretKey

        await client.user.create({
            data:{
                tgUserId: ctx.chat.id.toString(),
                publicKey : publicKey.toBase58(),
                privateKey : privateKey.toBase64()
            }
        })
        ctx.reply(`Welcome to our nobita bot. Here is your public key ${publicKey},
            You can trade on solana now.`,{
                ...DEFAULT_BUTTON
            })
        
    }
    
})


bot.action("public_key", async(ctx)=>{
    // get the public key from the db
    // console.log(ctx.chat?.id)
    const user = await client.user.findFirst({
        where:{
            tgUserId : ctx.chat?.id.toString()
        }
    })
    // console.log({user})
    const { empty, message } = await getBalanceMessage(user?.publicKey!)
    ctx.reply(`This is your public key ${user?.publicKey}. ${empty ? "Fund your wallet to trade" : message}`)
    return 
})

bot.action("private_key",async(ctx)=>{
    const user = await client.user.findFirst({
        where:{
            tgUserId : ctx.chat?.id.toString()
        }
    })
    ctx.reply(`This is your private key ${user?.privateKey}`)
})

bot.launch()