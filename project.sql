create database proje;

use proje;

create table users (emailid varchar(30) primary key, pwd varchar(30) , usertype varchar(40) , dos date , status int );

select * from users;

update users set status=0 where emailid="cdbjscbsdj@gmail.com" ;

create table cuprofile (emailid varchar(30) primary key , FName varchar(30) ,  contact varchar(15) , address varchar(100) ,  city varchar(30) , state varchar(50) , ppic varchar(300) );

select * from cuprofile; 

create table posttask (rid int primary key auto_increment , emailid varchar(50) , serviceCat varchar(100) , subServiceCat varchar(100) , address varchar(100) , city varchar(50) , state varchar(50) , UptoDate date , task varchar(300) );

select * from posttask;


create table serProvider(emailid varchar(30) primary key, FName varchar(30) ,  contact varchar(15) , gender varchar(15),  Firmaddress varchar(100) , Since varchar(5) , serviceCat varchar(100) , firm varchar(200) , website varchar(200) , idproof varchar(15) , ppic varchar(300) , textt varchar(400));
select * from serProvider ; 



