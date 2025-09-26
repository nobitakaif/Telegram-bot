import axios from "axios";

const JUP_URL = `https://lite-api.jup.ag`
const SLIPPAGE = 50
export async function swap(inputMint:string,outputMint:string,qty:number, publicKey : string){
    let quoteConfig = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${JUP_URL}/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${qty}&slippageBps=${SLIPPAGE}`,
        headers: { 
            'Accept': 'application/json'
        }
    };
    const resposne =await axios.request(quoteConfig)

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${JUP_URL}/swap/v1/swap?userPublicKey=${publicKey}`,
        headers: { 
            'Content-Type' : 'application/json',
            'Accept': 'application/json'
        },
        data : resposne.data
    };

    const res = await axios.request(config)
    return res.data.swapTransaction
}