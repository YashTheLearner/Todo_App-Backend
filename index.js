const express = require("express");
const app = express();
const cors = require('cors');
const { UserModel, TodosModel } = require("./db");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const JWT_SECRET = "yashtodoapp";
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');

app.use(cors({ origin: 'https://todo-app-two-chi-76.vercel.app/', // Replace with your frontend URL
    credentials: true // Allow credentials to be sent
    }));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => { 
    res.json({message:"Welcome to the Todo App"});
});

app.post("/signup", async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    await UserModel.create({
        name: name,
        email: email,
        password: password,
    }).then((data) => {
        console.log(data);
        res.status(201).json({message:"login successful"});
    }).catch((err) => {
        res.status(500).json({message:"login failed, try again",err});
    }
    )
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    try {
      const user = await UserModel.findOne({ email});
      console.log(user);
      if (!user) {
        console.log("user not found");
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create a token
      const token = jwt.sign({ id: user._id }, JWT_SECRET);
  
    //   Set an HTTP-only cookie
      res.cookie('token', token, {
            httpOnly: true, // Prevents client-side access to the cookie
            secure: true,   // Ensures the cookie is sent over HTTPS
            sameSite: 'None' // Allows cross-site cookie use
          });
          
  
    //   Respond with success
      res.status(201).json({ message: 'Logged in successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
      console.error(error);
    }
  });
  
  
  
  
  
  
  
  
  
  
  
  
  
//     const email = req.body.email;
//     const password = req.body.password;

//     const user = await UserModel.findOne({
//         email: email,
//         password: password,
//     })
//     if (user) {
//         const token = jwt.sign({ id: user._id }, JWT_SECRET);
//         res.cookie('token', token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production', // Use true in production
//             maxAge: 3600000, // 1 hour
//           });
//         res.send('Signed in successfully');
//     } else {
//         res.status(403).json({
//             message: "Incorrect email or password"
//         });
//     }
// });

app.post("/logout", (req, res) => {
    try {
        // Clear the cookie
        res.clearCookie('token', {
            httpOnly: true,   // Prevent JavaScript access
            secure: false,    // Set to true in production if using HTTPS
            // sameSite: 'Strict', // Helps mitigate CSRF attacks
            // path: '/',        // Ensure the cookie path matches
        });

        // Send a success response
        res.status(200).send({ message: 'Logged out successfully' });

    } catch (error) {
        console.error('Error during logout:', error);

        // Send a failure response with a 500 status code
        res.status(500).send({
            message: 'Logout failed',
            error: error.message, // Optionally include the error message
        });
    }
});











app.get("/verify", (req, res) => {
    const generateOTP = () => {
        return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      };
      
      // Function to send OTP email
      const sendOTPEmail = async (email) => {
        const otp = generateOTP();
        console.log('Generated OTP:', otp);
        // Configure Nodemailer transport
        const transporter = nodemailer.createTransport({
          service: 'gmail', // or any other email service
          secure: true, // For TLS
          port: 465, // For SSL
          auth: {
            user: 'funcitykanha@gmail.com', // your email
            pass: 'wkdw aahj xpcx vbgu' // your email password or app password
          }
        });
      
        // Email options
        const mailOptions = {
          from: 'funcitykanha@gmail.com',
          to: email,
          subject: 'Your OTP Code',
          text: `Your OTP code is: ${otp}`
        };
      
        try {
          await transporter.sendMail(mailOptions);
          console.log('OTP sent to:', email);
          return otp; // Return the OTP to validate later
        } catch (error) {
          console.error('Error sending email:', error);
        }
      };
      
      // Usage
      const userEmail = 'yashdefying@gmail.com';
      sendOTPEmail(userEmail).then(otp => {
        // Save the OTP in a database or memory for later verification
        console.log('Generated OTP:', otp);
      });

})

function auth(req, res, next) {
    
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            message: "You need to login"
        });
    }
    else {
        jwt.verify(token, JWT_SECRET, (err, data) => {
            if (err) {
                return res.status(403).json({
                    message: "Invalid token"
                });
            }
            else{
                
                req.user = data;
            next();
        }
        })
    }
}

app.use(auth);

app.get("/todos", async(req, res) => {
    const UserId = req.user.id;
    let todos = await TodosModel.find({UserId:UserId});
    res.status(200).json({todos});
});

app.post("/add",async (req, res) => {
    const task = req.body.task;
    const UserId = req.user.id;
    let todo = await TodosModel.create({
        UserId: UserId,
        task: task,
    });
    res.status(200).json({TodoId:todo._id})
});
app.delete("/delete",async (req, res) => {
    const TodoId = req.body.taskId;
    res.status(200).send("Task deleted successfully");

    await TodosModel.deleteOne({_id:TodoId });
    
 })
app.put("/update",async (req, res) => {
    const TodoId = req.body.taskId;
    const isChecked = req.body.isChecked;
    await TodosModel.updateOne({_id:TodoId},{$set:{isChecked:!isChecked}});
    res.status(200).send("Task updated successfully");
})

const PORT =  process.env.PORT || 3000;
const MONGO_URI = "mongodb+srv://yashdefying:dho727rDb2ZTqoB3@cluster0.fefhf.mongodb.net/TodoApp-2";

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit process with failure
  }
}

startServer();