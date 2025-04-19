import {app, TICKER} from "../index"
import request from "supertest"

describe("Zerodha Backend Test Suite", () => {
    it("verify initial balances", async () => {
        const response = await request(app).get("/getBalance/1");
        expect(response.body.balance[TICKER]).toBe(10);
        const response2 = await request(app).get("/getBalance/2");
        expect(response2.body.balance[TICKER]).toBe(10);
    })
    
    it("create an order", async () => {
        await request(app).post("/order").send({
            side: "BID",
            price: 1400.1,
            quantity: 1,
            userId: "1"
        });
      
        await request(app).post("/order").send({
            side: "ASK",
            price: 1400.9,
            quantity: 10,
            userId: "2"
        });
      
        await request(app).post("/order").send({
            side: "ASK",
            price: 1501,
            quantity: 5,
            userId: "2"
        });
        
        let res = await request(app).get("/depth");
        expect(res.status).toBe(200);
        expect(res.body.depth["1501"].quantity).toBe(5);
    })
    
    it("ensures balances are still the same", async () => {
        let res = await request(app).get("/getBalance/1");
        expect(res.body.balance[TICKER]).toBe(10);
    })
    
    it("Places an order that fills", async () => {
        let res = await request(app).post("/order").send({
            side: "BID",
            price: 1502,
            quantity: 2,
            userId: "1"
        });
        expect(res.body.filledQuantity).toBe(2);
    });
    
    it("Ensures orderbook updates", async () => {
        let res = await request(app).get("/depth");
        expect(res.body.depth["1400.9"]?.quantity).toBe(8);
    })
    
    it("Ensures balances update", async () => {
        let res = await request(app).get("/getBalance/1");
        expect(res.body.balance[TICKER]).toBe(12);
        expect(res.body.balance["USDT"]).toBe(50000 - 2 * 1400.9);
    
        res = await request(app).get("/getBalance/2");
        expect(res.body.balance[TICKER]).toBe(8);
        expect(res.body.balance["USDT"]).toBe(50000 + 2 * 1400.9);
    })
})