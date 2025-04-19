import bodyParser from "body-parser";
import express from "express";

const app = express();

app.use(bodyParser.json());

interface Balances{
    [key:string]:number

}

interface User{
    userId:string;
    balance:Balances;
}

interface Order{
    userId:string;
    price:number;
    quantity:number;
}


export const TICKER = "SOL"

export const USERS:User[] = [
    {
        userId:"1",
        balance:{
            "SOL":10,
            "USDT":50000
        }
    },
    {
        userId:"2",
        balance:{
            "SOL":10,
            "USDT":50000
        }
    }
]

const bids:Order[] = [];
const asks:Order[] = [];

app.post("/order",(req,res)=>{
    const side:string = req.body.side;
    const quantity:number = req.body.quantity;
    const price:number = req.body.price;
    const userId:string = req.body.userId;
    
    const remainingQuantity = fillOrder(side,quantity,price,userId);

    if(remainingQuantity == 0){
        res.json({filledQuantity:quantity});
        return;
    }
    if(side == "BID")
    {
       bids.push({userId,price,quantity:remainingQuantity});
       bids.sort((a, b) => a.price < b.price ? -1 : 1);
    }
    else{
        asks.push({userId,price,quantity:remainingQuantity});
        asks.sort((a,b)=>a.price<b.price?1:-1);
    }
    res.json({
        filledQuantity: quantity - remainingQuantity,
    })
})

app.get("/depth",(req,res)=>{
    const depth: {
        [price: string]: {
          type: "bid" | "ask",
          quantity: number,
        }
      } = {};
    
      for (let i = 0; i < bids.length; i++) {
        if (!depth[bids[i].price]) {
          depth[bids[i].price] = {
            quantity: bids[i].quantity,
            type: "bid"
          };
        } else {
          depth[bids[i].price].quantity += bids[i].quantity;
        }
      }
    
      for (let i = 0; i < asks.length; i++) {
        if (!depth[asks[i].price]) {
          depth[asks[i].price] = {
            quantity: asks[i].quantity,
            type: "ask"
          }
        } else {
          depth[asks[i].price].quantity += asks[i].quantity;
        }
      }
    
      res.json({
        depth
      })
})

app.get("/getBalance/:userId",(req:any,res:any)=>{
    const userId = req.params.userId;
    const user = USERS.find(u=>u.userId==userId);
    if(!user){
    return res.status(404).json({
        USD:0,
        [TICKER]:0
    })
    }
     res.json({balance:user.balance});
})


function fillOrder(side:string,quantity:number,price:number,userId:string):number{
   let remainingQuantity = quantity;
   if(side == "BID"){
    for (let i = asks.length - 1 ;i>=0;i--){
        if(asks[i].price>price){
            continue;
        }
        if(asks[i].quantity>remainingQuantity){
            asks[i].quantity -= remainingQuantity;
            flipBalance(asks[i].userId,userId,asks[i].price,remainingQuantity);
            return 0;
        }
        else{
            remainingQuantity -= asks[i].quantity;
            flipBalance(asks[i].userId,userId,asks[i].price,asks[i].quantity);
            asks.pop();
        }

    }

   }
   else{
    for (let i = bids.length - 1 ;i>=0;i--){
        if(bids[i].price<price){
            continue;
        }
        if(bids[i].quantity>remainingQuantity){
            bids[i].quantity -= remainingQuantity;
            flipBalance(bids[i].userId,userId,bids[i].price,remainingQuantity);
            return 0;
        }
        else{
            remainingQuantity -= bids[i].quantity;
            flipBalance(bids[i].userId,userId,bids[i].price,bids[i].quantity);
            bids.pop();
        }

    }
   }
   return remainingQuantity;
}
function flipBalance(userId1:string,userId2:string,price:number,quantity:number){
    let user1 = USERS.find(u=>u.userId == userId1);
    let user2= USERS.find(u=>u.userId == userId2);
    if(!user1||!user2){
        return;
    }
    user1.balance[TICKER] -= quantity;
    user2.balance[TICKER] +=quantity;
    user1.balance["USDT"] += (price*quantity);
    user2.balance["USDT"] -= (price*quantity);

}
app.listen(3000,()=>{
    console.log("Server running on port 3000");
})
export {app}