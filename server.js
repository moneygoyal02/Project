const express = require("express");
const app = express(); //it returns object
const fileuploader = require("express-fileupload");
const mysql2 = require("mysql2");

app.listen(3010, function () {
  console.log("Server Started at port :3010");
});

app.use(express.static("public"));

const congObj = {
  host: "127.0.0.1",
  user: "root",
  password: "Money@90410",
  database: "proje",
  dateStrings: true,
};

const mysql = mysql2.createConnection(congObj);

mysql.connect(function (err) {
  if (err == null) console.log("connected to database");
  else console.log(err.message);
});

app.use(express.urlencoded({ extended: true }));
app.use(fileuploader());

// ------------------node mailer------------------------
const nodemailer = require("nodemailer");

require("dotenv").config();

function sendConfirmationEmail(email) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.user,
      pass: process.env.APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: {
      name: "money goyal",
      address: process.env.user,
    },
    to: [email],
    subject: "Welcome to our website",
    text: "Thank you for signing up!",
    html: "<b>Thank you for signing up!</b>",
  };

  transporter.sendMail(mailOptions, function (error) {
    if (error) {
      console.error(error);
    } else {
      console.log("email sent successfully");
    }
  });
}

function sendLoginConfirmationEmail(email) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.user,
      pass: process.env.APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: {
      name: "money goyal",
      address: process.env.user,
    },
    to: [email],
    subject: "Login Confirmation",
    text: "You have successfully logged in!",
    html: "<b>You have successfully logged in!</b>",
  };

  transporter.sendMail(mailOptions, function (error) {
    if (error) {
      console.error(error);
    } else {
      console.log("email sent successfully");
    }
  });
}

// ---------------------------------------------------------

app.get("/", function (req, resp) {
  let filePath = process.cwd() + "/public/first.html";
  resp.sendFile(filePath);
});

app.post("/profile-save", function (req, resp) {
  // create table users (emailid varchar(30) primary key, pwd varchar(30) , usertype varchar(10) , dos date , status int );
  const email = req.body.txttEmail;
  const password = req.body.txtPwd;
  const usertype = req.body.utype;
  const status = 1;

  mysql.query(
    "insert into users values(?,?,?,current_date(),?)",
    [email, password, usertype, status],
    function (err) {
      if (err == null) {
        resp.send("Sign up successfully");
        sendConfirmationEmail(email);
      } else resp.send(err.message);
    }
  );
});

app.get("/checkk-email", function (req, resp) {
  mysql.query(
    "select * from users where emailid=?",
    [req.query.kuchEmail],
    function (err, resultJsonAry) {
      if (resultJsonAry.length == 1) resp.send("Email already exists");
      else resp.send("Email is available");
    }
  );
});

app.get("/checkk-login-email", function (req, resp) {
  mysql.query(
    "select * from users where emailid=?",
    [req.query.kuchhEmail],
    function (err, resultJsonAry) {
      if (resultJsonAry.length == 1) resp.send("&#9989;");
      else resp.send("Account does not exist.");
    }
  );
});

app.post("/checkk-login-info", function (req, resp) {
  const txtEmail = req.body.email;

  const logpass = req.body.password;

  mysql.query(
    "select * from users where emailid = ? and pwd = ?",
    [txtEmail, logpass],
    function (err, resultJsonAry) {
      if (err) {
        resp.send(err.message);

        return;
      }

      if (resultJsonAry.length == 1) {
        if (resultJsonAry[0].status == 1) {
          const userType = resultJsonAry[0].usertype;
          sendLoginConfirmationEmail(txtEmail);

          resp.send(userType);
        } else resp.send("Ur Account Is blocked !! Contact Admin");
      } else {
        resp.send("Invalid email or password");
      }
    }
  );
});

// ------------------------------------------cust prof-------------------------

app.get("/cp", function (req, resp) {
  let filepath = process.cwd() + "/public/Profile-customer.html";

  resp.sendFile(filepath);
});

app.post("/saveee", function (req, resp) {
  // data : {name : name ,contact : cont , address : addre , state :state , city : city , ppic : pic},
  // (emailid varchar(30) primary key , FName varchar(30) ,  contact varchar(15) , address varchar(100) ,  city varchar(30) , state varchar(50) , ppic varchar(300) );
  
  if (req.body.checkbox === "checked") {
    const namee = req.body.name;
    const contact = req.body.contact;
    const addr = req.body.address;
    const state = req.body.state;
    const city = req.body.city;

    const email = req.body.email;

    console.log(email);

    let filename;
    if (req.files == null) filename = "nopic.jpg";
    else {
      filename = req.files.ppic.name;
      let path = process.cwd() + "/public/uploads/" + filename;
      req.files.ppic.mv(path);
      
    }

    req.body.ppic = filename;

    mysql.query(
      " insert into cuprofile values(?,?,?,?,?,?,?)",
      [email, namee, contact, addr, city, state, filename],
      function (err) {
        if (err == null) {
          console.log("Profile saved Successfully");

          resp.send("Profile saved Successfully");
        } else {
          console.log(err.message);
          resp.send("Error saving profile");
        }
      }
    );
  } else {
    console.log("please aggre to term&conditions");
    resp.send("Please agree to terms & conditions");
  }
});

app.get("/search", function (req, resp) {
  const email = req.query.email;

  mysql.query(
    "select * from cuprofile where emailid=?",
    [email],
    function (err, ary) {
      console.log(ary);
      resp.send(ary);
    }
  );
});

app.post("/update", function (req, resp) {
  // data : {name : name ,contact : cont , address : addre , state :state , city : city , ppic : pic},

  if (req.body.checkbox === "checked") {
    const namee = req.body.name;
    const contact = req.body.contact;
    const addr = req.body.address;
    const state = req.body.state;
    const city = req.body.city;

    const email = req.body.email;

    let filename;
    if (req.files && req.files.ppic) {
      // Check if req.files is not null or undefined, and if ppic property exists
      filename = req.files.ppic.name;
      let path = process.cwd() + "/public/uploads/" + filename;
      req.files.ppic.mv(path);
    } else {
      // Handle case when req.files is null or undefined
      filename = req.body.hdn;
    }
    req.body.ppic = filename;

    // (emailid varchar(30) primary key , FName varchar(30) ,  contact varchar(15) , address varchar(100) ,  city varchar(30) , state varchar(50) , ppic varchar(300) );

    mysql.query(
      " update cuprofile set Fname=? , contact=? , address=? , city=? , state=? , ppic=? where emailid=? ",
      [namee, contact, addr, city, state, filename, email],
      function (err) {
        if (err == null) {
          console.log("Profile updated Successfully");

          resp.send("Profile updated Successfully");
        } else {
          console.log(err.message);
          resp.send("Error updating profile");
        }
      }
    );
  } else {
    console.log("please aggre to term&conditions");
    resp.send("Please agree to terms & conditions");
  }
});

// -------------------------------------customer-dash-------------------------------

app.get("/cd", function (req, resp) {
  let filepath = process.cwd() + "/public/customer-Dash.html";

  resp.sendFile(filepath);
});

app.get("/changepass", function (req, resp) {
  let email = req.query.email;
  let oldpass = req.query.oldpwd;
  let newpass = req.query.newpwd;

  mysql.query(
    "update users set pwd = ? WHERE emailid = ? and pwd = ?",
    [newpass, email, oldpass],
    function (err) {
      if (err) {
        resp.send("Error updating password");
      } else resp.send("Update successful");
    }
  );
});

app.get("/fetchAdd", function (req, resp) {
  const email = req.query.email;

  mysql.query(
    "select * from cuprofile where emailid=?",
    [email],
    function (err, arry) {
      if (err) {
        resp.send(err.message);
      } else {
        resp.send(arry);
      }
    }
  );
});

app.get("/checkkk-login-email", function (req, resp) {
  mysql.query(
    "select * from cuprofile where emailid=?",
    [req.query.kuchhEmail],
    function (err, resultJsonAry) {
      if (resultJsonAry.length == 1) resp.send("&#9989;");
      else resp.send("Account does not exist.");
    }
  );
});

app.get("/postjobbtn", function (req, resp) {
  // email: $("#txttEmail").val(),
  //             tc: $("#sc").val(),
  //             stc: $("#stc").val(),
  //             add: $("#addre").val(),
  //             city: $("#City").val(),
  //             state: $("#State").val(),
  //             uptodate: $("#dat").val(),
  //             task: $("#Taskk").val()
  const rid = 0;

  mysql.query(
    "insert into posttask values (?,?,?,?,?,?,?,?,?)",
    [
      rid,
      req.query.email,
      req.query.tc,
      req.query.stc,
      req.query.add,
      req.query.city,
      req.query.state,
      req.query.uptodate,
      req.query.task,
    ],
    function (err) {
      if (err) {
        resp.send(err.message);
      } else {
        resp.send("data stored successfullyyy");
      }
    }
  );
});

// --------------------------------------service provider profile -----------------------------------

app.get("/sp", function (req, resp) {
  let filePath = process.cwd() + "/public/Profile-Service-provider.html";
  resp.sendFile(filePath);
});

app.post("/serv-save", function (req, resp) {
  if (req.body.checkbox === "checked") {
    let filename;
    if (req.files == null) filename = "nopic.jpg";
    else {
      filename = req.files.ppic.name;
      let path = process.cwd() + "/public/uploads/" + filename;
      req.files.ppic.mv(path);
    }

    req.body.ppic = filename;

    mysql.query(
      "insert into serProvider values (?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        req.body.email,
        req.body.name,
        req.body.contact,
        req.body.inlineRadioOptions,
        req.body.address,
        req.body.since,
        req.body.sc,
        req.body.firm,
        req.body.web,
        req.body.id,
        filename,
        req.body.txtar,
      ],
      function (err) {
        if (err == null) {
          console.log("Profile saved Successfully");

          resp.send("Profile saved Successfully");
        } else {
          console.log(err.message);
          resp.send("Error saving profile");
        }
      }
    );
  } else {
    console.log("please aggre to term&conditions");
    resp.send("Please agree to terms & conditions");
  }
});

app.get("/checkk-email-serprof", function (req, resp) {
  mysql.query(
    "select * from serProvider where emailid=?",
    [req.query.kuchEmail],
    function (err, resultJsonAry) {
      if (resultJsonAry.length == 1) resp.send("Email already exists");
      else resp.send("Email is available");
    }
  );
});

app.post("/usp", function (req, resp) {
  let filename;
  if (req.files == null) filename = "req.body.hdn";
  else {
    filename = req.files.ppic.name;
    let path = process.cwd() + "/public/uploads/" + filename;
    req.files.ppic.mv(path);
  }

  req.body.ppic = filename;

  mysql.query(
    "update serProvider set FName=? , contact=? , gender=? , Firmaddress=? , Since = ? , serviceCat=? , firm=?, website=? , idproof=? , ppic=? , textt=? where emailid=?",
    [
      req.body.name,
      req.body.contact,
      req.body.inlineRadioOptions,
      req.body.address,
      req.body.since,
      req.body.sc,
      req.body.firm,
      req.body.web,
      req.body.id,
      filename,
      req.body.txtar,
      req.body.email,
    ],
    function (err) {
      if (err == null) {
        console.log("Profile update Successfully");

        resp.send("Profile update Successfully");
      } else {
        console.log(err.message);
        resp.send("Error updating profile");
      }
    }
  );
});

app.get("/searche", function (req, resp) {
  const email = req.query.email;

  mysql.query(
    "select * from serProvider where emailid=?",
    [email],
    function (err, ary) {
      console.log(ary);
      resp.send(ary);
    }
  );
});

// --------------------------------------ADMIN-DASH---------------------------------------------

app.get("/admin", function (req, resp) {
  let filepath = process.cwd() + "/public/Admin.html";
  resp.sendFile(filepath);
});

app.get("/um", function (req, resp) {
  let filepath = process.cwd() + "/public/users-manager.html";
  resp.sendFile(filepath);
});

app.get("/ap", function (req, resp) {
  let filepath = process.cwd() + "/public/all-providers.html";
  resp.sendFile(filepath);
});

app.get("/ac", function (req, resp) {
  let filepath = process.cwd() + "/public/all-customer.html";
  resp.sendFile(filepath);
});

app.get("/angular-fetch-all", function (req, resp) {
  mysql.query("select * from users", function (err, result) {
    if (err) {
      resp.send(err.message);
      return;
    } else resp.send(result);
  });
});

app.get("/block", function (req, resp) {
  const email = req.query.email;
  const sta = 0;
  // console.log(req.query.email);

  mysql.query(
    "select * from users where emailid=?",
    [email],
    function (err, result) {
      if (err) {
        resp.send(err.message);

        return;
      } else {
        const currentStatus = result[0].status;

        if (currentStatus === 0) {
          resp.send("ALREADY BLOCKED");
          // console.log("ALREADY BLOCKED");
          return;
        } else {
          mysql.query(
            "update users set status=? where emailid=? ",
            [sta, email],
            function (errr) {
              if (errr) resp.send(errr.message);
              else resp.send("User status updated successfully.");
            }
          );
        }
      }
    }
  );
});

app.get("/resume", function (req, resp) {
  const email = req.query.email;
  const sta = 1;
  // console.log(req.query.email);

  mysql.query(
    "select * from users where emailid=?",
    [email],
    function (err, result) {
      if (err) {
        resp.send(err.message);

        return;
      } else {
        const currentStatus = result[0].status;

        if (currentStatus === 1) {
          resp.send("ALREADY STATUS='1'");

          return;
        } else {
          mysql.query(
            "update users set status=? where emailid=? ",
            [sta, email],
            function (errr) {
              if (errr) resp.send(errr.message);
              else resp.send("User status updated successfully.");
            }
          );
        }
      }
    }
  );
});

app.get("/angular-fetch-allproviders", function (req, resp) {
  const user="Service-Provider-Dash";
  console.log
  mysql.query("select * from users where usertype=?",[user], function (err, result) {
    if (err) {
      resp.send(err.message);
      return;
    } else resp.send(result);
  });
});

app.get("/angular-fetch-allcustomer", function (req, resp) {
  const user="Customer-Dash";
  console.log
  mysql.query("select * from users where usertype=?",[user], function (err, result) {
    if (err) {
      resp.send(err.message);
      return;
    } else resp.send(result);
  });
});

// -------------------search-service-provider-------------------------------

app.get("/ssp",function(req,resp){

  let filepath=process.cwd()+"/public/search-service-provider.html";
  resp.sendFile(filepath);
});

app.get("/angular-fetch-allserviproviders",function(req,resp){
  
  mysql.query("select * from serProvider", function (err, result) {
    if (err) {
      resp.send(err.message);
      return;
    } else resp.send(result);
  });

})

// ----------------------------service provide dash---------------------------------------

app.get("/spd",function(req,resp){

  let filepath=process.cwd()+"/public/service-provider-dash.html";
  resp.sendFile(filepath);
});

app.get("/changepassserv", function (req, resp) {
  let email = req.query.email;
  let oldpass = req.query.oldpwd;
  let newpass = req.query.newpwd;

  mysql.query(
    "update users set pwd = ? WHERE emailid = ? and pwd = ?",
    [newpass, email, oldpass],
    function (err) {
      if (err) {
        resp.send("Error updating password");
      } else resp.send("Update successful");
    }
  );
});


// ------------------------find-job------------------------------------

app.get("/fj",function(req,resp){

  let filepath=process.cwd()+"/public/find-job.html";
  resp.sendFile(filepath);
});

app.get("/angular-fetch-alljobs",function(req,resp){
  
  mysql.query("select * from posttask", function (err, result) {
    if (err) {
      resp.send(err.message);
      return;
    } else resp.send(result);
  });

})

