const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qhpx3vr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db("bloodDonationDB").collection("users");
    const donationCollection = client
      .db("bloodDonationDB")
      .collection("donationRequests");

    // --------------------------------------------------------------------------
    //                            user related api
    // --------------------------------------------------------------------------
    // save user's info to the database
    app.post("/users", async (req, res) => {
      const user = req.body;
      //   console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // get specific user
    app.get("/users/:id", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    // update specific user's info
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const user = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: user.name,
          email: user.email,
          photo: user.photo,
          bloodGroup: user.bloodGroup,
          district: user.district,
          upazila: user.upazila,
          role: user.role,
          status: user.status,
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      console.log(result);
      res.send(result);
    });

    // --------------------------------------------------------------------------
    //                            donation related api
    // --------------------------------------------------------------------------
    // create donation requests
    app.post("/create-donation", async (req, res) => {
      const donationRequest = req.body;
      // console.log(donationRequest);
      const result = await donationCollection.insertOne(donationRequest);
      res.send(result);
    });

    // get all donation's for specific user
    app.get("/donations/:email", async (req, res) => {
      const email = req.params.email;
      const query = { requesterEmail: email };
      const result = await donationCollection.find(query).toArray();
      res.send(result);
    });

    // get specific donation data
    app.get("/donation/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await donationCollection.findOne(query);
      res.send(result);
    });

    app.put("/donations/:id", async (req, res) => {
      const id = req.params.id;
      const donation = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          requesterName: donation.requesterName,
          requesterEmail: donation.requesterEmail,
          recipientName: donation.recipientName,
          recipientDistrict: donation.recipientDistrict,
          recipientUpazila: donation.recipientUpazila,
          hospitalName: donation.hospitalName,
          fullAddress: donation.fullAddress,
          donationDate: donation.donationDate,
          donationTime: donation.donationTime,
          requestMessage: donation.requestMessage,
        },
      };
      const result = await donationCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // delete donation request
    app.delete("/donations/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await donationCollection.deleteOne(query);
      res.send(result);
    });

    // --------------------------------------------------------------------------
    //                            pagination related api
    // --------------------------------------------------------------------------
    // for pagination table
    app.get("/pagination/:email", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const email = req.params.email;
      const query = { requesterEmail: email };
      const result = await donationCollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    // get donation requests count
    app.get("/donationsCount/:email", async (req, res) => {
      const email = req.params.email;
      const query = { requesterEmail: email };
      const count = await donationCollection.countDocuments(query);
      res.send({ count });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Blood Donation server is running");
});

app.listen(port, () => {
  console.log(`Blood Donation server is running on port: ${port}`);
});
