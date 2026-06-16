-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 23, 2025 at 05:55 AM
-- Server version: 10.1.38-MariaDB
-- PHP Version: 5.6.40

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `f_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `aamarpay`
--

CREATE TABLE `aamarpay` (
  `id` int(100) NOT NULL,
  `cus_name` text NOT NULL,
  `amount` int(100) NOT NULL,
  `status` varchar(100) NOT NULL,
  `pay_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `transaction_id` varchar(100) NOT NULL,
  `card_type` varchar(100) NOT NULL,
  `order_id` int(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `aamarpay`
--

INSERT INTO `aamarpay` (`id`, `cus_name`, `amount`, `status`, `pay_time`, `transaction_id`, `card_type`, `order_id`) VALUES
(1, 'tarun vaghani', 250, 'Cancelled', '2025-01-20 16:18:28', 'ONL-PAY-RPFQLAUGQA', 'master card', 1),
(2, 'tarun vaghani', 600, 'Cancelled', '2025-01-20 16:39:29', 'ONL-PAY-REZFMC1WJG', 'master card', 2),
(3, 'tarun vaghani', 500, 'successful', '2025-01-21 10:17:29', 'ONL-PAY-NJ4E4PZPP5', 'master card', 3),
(4, 'kenil maniya', 1000, 'successful', '2025-01-21 11:21:05', 'ONL-PAY-I0VXHPCS20', 'master card', 4),
(5, 'tarun vaghani', 1200, 'successful', '2025-01-21 11:31:37', 'ONL-PAY-KJD8OAWDVL', 'master card', 5),
(6, 'kenil maniya', 1350, 'successful', '2025-01-21 14:12:28', 'ONL-PAY-90AG1AMZX1', 'master card', 6),
(7, 'kenil maniya', 1350, 'successful', '2025-01-21 15:12:23', 'ONL-PAY-OK0FD1B6NH', 'master card', 7),
(8, 'tarun vaghani', 750, 'successful', '2025-01-22 03:53:56', 'ONL-PAY-6739AIC4VX', 'master card', 8),
(9, 'tarun vaghani', 600, 'successful', '2025-01-22 09:28:06', 'ONL-PAY-7VUR9SU1NS', 'master card', 9),
(10, 'kenil maniya', 1350, 'successful', '2025-01-22 10:03:58', 'ONL-PAY-77SZM9T90V', 'master card', 10),
(11, 'kenil maniya', 250, 'successful', '2025-01-22 10:33:25', 'ONL-PAY-6790c958ec853', 'card', 11),
(12, 'kenil maniya', 500, 'Cancelled', '2025-01-22 10:52:32', 'ONL-PAY-6790cd284ec8d', 'card', 12),
(13, 'tarun vaghani', 480, 'Cancelled', '2025-01-24 10:39:44', 'ONL-PAY-67936ceb722b3', 'card', 13),
(14, 'tarun vaghani', 1080, 'successful', '2025-01-24 10:42:35', 'ONL-PAY-67936e7f9b507', 'card', 14),
(15, 'tarun vaghani', 250, 'successful', '2025-01-25 04:19:47', 'ONL-PAY-679466478cc91', 'card', 15),
(16, 'tarun vaghani', 500, 'successful', '2025-01-25 06:14:55', 'ONL-PAY-6794813c50318', 'card', 16),
(17, 'kenil maniya', 600, 'successful', '2025-01-25 12:08:41', 'ONL-PAY-6794d436af0b6', 'card', 17),
(18, 'tarun vaghani', 2200, 'successful', '2025-01-26 04:49:59', 'ONL-PAY-6795bed4a7d17', 'card', 18),
(19, 'kenil maniya', 3800, 'successful', '2025-01-26 04:56:08', 'ONL-PAY-6795c0402caaa', 'card', 19),
(20, 'kenil maniya', 250, 'successful', '2025-01-26 13:08:52', 'ONL-PAY-679633cb17e31', 'card', 20),
(21, 'tarun vaghani', 250, 'successful', '2025-01-27 02:16:09', 'ONL-PAY-6796ec497679c', 'card', 21),
(22, 'kenil maniya', 500, 'successful', '2025-01-27 02:18:47', 'ONL-PAY-6796ecf0bac92', 'card', 22),
(23, 'kenil maniya', 2200, 'successful', '2025-01-27 02:51:23', 'ONL-PAY-6796f48f13a3f', 'card', 23),
(24, 'tarun vaghani', 250, 'successful', '2025-01-27 10:41:54', 'ONL-PAY-679762d76c0ab', 'card', 24),
(25, 'kenil maniya', 250, 'Cancelled', '2025-01-27 11:02:48', 'ONL-PAY-679764c901f0b', 'card', 25),
(26, 'kenil maniya', 250, 'Cancelled', '2025-01-27 11:02:51', 'ONL-PAY-679766483225c', 'card', 26),
(27, 'kenil maniya', 250, 'successful', '2025-01-27 11:03:14', 'ONL-PAY-679767e032d72', 'card', 27),
(28, 'kenil maniya', 600, 'successful', '2025-01-28 04:48:20', 'ONL-PAY-6798617b9e4ab', 'card', 28),
(29, 'kenil maniya', 200, 'successful', '2025-01-28 14:18:54', 'ONL-PAY-6798e7315cc60', 'card', 29),
(30, 'tarun vaghani', 2450, 'successful', '2025-01-29 05:14:01', 'ONL-PAY-6799b908080ea', 'card', 30),
(31, 'kenil maniya', 250, 'successful', '2025-01-29 10:03:41', 'ONL-PAY-6799fcedf11a7', 'card', 31),
(32, 'juhil desai', 250, 'successful', '2025-01-29 15:04:45', 'ONL-PAY-679a43628da3b', 'card', 32),
(33, 'juhil desai', 500, 'successful', '2025-01-30 03:57:18', 'ONL-PAY-679af88734f62', 'card', 33),
(34, '', 880, 'Cancelled', '2025-02-15 11:27:04', 'ONL-PAY-67b0796050087', 'card', 34),
(35, 'kunal pipeliya', 880, 'successful', '2025-02-15 11:27:50', 'ONL-PAY-67b07a1641815', 'card', 35),
(36, 'tarun vaghani', 250, 'Cancelled', '2025-02-17 13:56:10', 'ONL-PAY-67b33f0670e89', 'card', 36),
(37, 'tarun vaghani', 750, 'successful', '2025-02-17 14:22:12', 'ONL-PAY-67b345ff92fce', 'card', 37),
(38, 'juhil desai', 920, 'successful', '2025-02-20 06:04:12', 'ONL-PAY-67b6c5c3581c4', 'card', 38),
(39, 'juhil desai', 200, 'successful', '2025-02-20 06:38:34', 'ONL-PAY-67b6cdd278487', 'card', 39),
(40, 'kenil maniya', 850, 'Cancelled', '2025-02-20 14:35:18', 'ONL-PAY-67b73b0f78728', 'card', 40),
(41, 'kenil maniya', 850, 'Cancelled', '2025-02-20 14:35:26', 'ONL-PAY-67b73d6ef418f', 'card', 41),
(42, 'juhil desai', 690, 'Cancelled', '2025-02-20 17:39:51', 'ONL-PAY-67b76850c058f', 'card', 42),
(43, 'juhil desai', 460, 'Cancelled', '2025-02-20 17:39:53', 'ONL-PAY-67b768a006151', 'card', 43),
(44, 'juhil desai', 690, 'successful', '2025-02-20 17:42:17', 'ONL-PAY-67b7696a1ca9d', 'card', 44),
(45, 'juhil desai', 250, 'Cancelled', '2025-02-20 18:13:32', 'ONL-PAY-67b76bf3c757b', 'card', 45),
(46, 'juhil desai', 480, 'Cancelled', '2025-02-20 18:13:34', 'ONL-PAY-67b76ca093475', 'card', 46),
(47, 'juhil desai', 480, 'Cancelled', '2025-02-20 18:13:36', 'ONL-PAY-67b76d755cbb4', 'card', 47),
(48, 'juhil desai', 480, 'Cancelled', '2025-02-20 18:13:37', 'ONL-PAY-67b77064a03e7', 'card', 48),
(49, 'juhil desai', 600, 'successful', '2025-02-20 18:42:37', 'ONL-PAY-67b7778b14e88', 'card', 49),
(50, 'juhil desai', 300, 'successful', '2025-02-21 04:56:06', 'ONL-PAY-67b807508432b', 'card', 50),
(51, 'tarun vaghani', 500, 'successful', '2025-02-22 04:15:02', 'ONL-PAY-67b94f30e2ffd', 'card', 51),
(52, 'tarun vaghani', 250, 'Cancelled', '2025-02-22 10:55:24', 'ONL-PAY-67b97abfd99f8', 'card', 52),
(53, 'tarun vaghani', 2450, 'successful', '2025-02-22 10:56:52', 'ONL-PAY-67b9ad5ada5b2', 'card', 53),
(54, 'tarun vaghani', 100, 'Cancelled', '2025-02-24 08:47:06', 'ONL-PAY-67bc3174af773', 'card', 54),
(55, 'juhil desai', 830, 'Cancelled', '2025-03-15 13:24:48', 'ONL-PAY-67d57f5c5c96c', 'card', 55),
(56, 'juhil desai', 250, 'cod', '2025-03-15 13:26:48', 'ONL-PAY-67d58010320dd', 'card', 56),
(57, 'prince gangani', 1280, 'successful', '2025-03-20 12:57:36', 'ONL-PAY-67dc10a87869a', 'card', 57),
(58, 'tarun vaghani', 440, 'successful', '2025-03-20 16:52:50', 'ONL-PAY-67dc47c401228', 'card', 58);

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE `message` (
  `id` int(11) NOT NULL,
  `name` text NOT NULL,
  `phone` bigint(20) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `message` longtext NOT NULL,
  `message_status` varchar(100) NOT NULL,
  `date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `message`
--

INSERT INTO `message` (`id`, `name`, `phone`, `subject`, `message`, `message_status`, `date`) VALUES
(1, 'tarun', 9978043407, 'testing', 'hello this is a testing', 'read', '2025-01-22 05:05:44'),
(2, 'tarun vaghani', 9978043407, 'test', 'testing', 'read', '2025-02-20 12:41:47');

-- --------------------------------------------------------

--
-- Table structure for table `online_orders_new`
--

CREATE TABLE `online_orders_new` (
  `order_id` int(100) NOT NULL,
  `Item_Name` varchar(100) NOT NULL,
  `Price` int(100) NOT NULL,
  `Quantity` int(100) NOT NULL,
  `restro_name` varchar(255) NOT NULL DEFAULT 'Pasar Kita',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `online_orders_new`
--

INSERT INTO `online_orders_new` (`order_id`, `Item_Name`, `Price`, `Quantity`, `restro_name`, `total_amount`) VALUES
(3, 'Farm Villa Pizza', 500, 1, 'Pasar Kita', '500.00'),
(4, 'Farm Villa Pizza', 500, 1, 'Pasar Kita', '500.00'),
(4, 'Chessy ham burger', 250, 2, 'Pasar Kita', '500.00'),
(5, '7-Chessy Pizza', 600, 2, 'Pasar Kita', '1200.00'),
(6, '7-Chessy Pizza', 600, 1, 'Pasar Kita', '600.00'),
(6, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(6, 'Farm Villa Pizza', 500, 1, 'Pasar Kita', '500.00'),
(7, '7-Chessy Pizza', 600, 1, 'Pasar Kita', '600.00'),
(7, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(7, 'Farm Villa Pizza', 500, 1, 'Pasar Kita', '500.00'),
(8, 'Farm Villa Pizza', 500, 1, 'Pasar Kita', '500.00'),
(8, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(9, '7-Chessy Pizza', 600, 1, 'Pasar Kita', '600.00'),
(10, 'Farm Villa Pizza', 500, 1, 'Pasar Kita', '500.00'),
(10, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(10, '7-Chessy Pizza', 600, 1, 'Pasar Kita', '600.00'),
(11, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(12, 'Farm Villa Pizza', 500, 1, 'Pasar Kita', '500.00'),
(13, '7-Chessy Pizza', 600, 1, 'Pasar Kita', '600.00'),
(14, 'Farm Villa Pizza', 500, 1, 'Pasar Kita', '500.00'),
(14, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(14, '7-Chessy Pizza', 600, 1, 'Pasar Kita', '600.00'),
(15, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(16, 'Farm Villa Pizza', 500, 1, 'Pasar Kita', '500.00'),
(17, '7-Chessy Pizza', 600, 1, 'Pasar Kita', '600.00'),
(18, 'Farm Villa Pizza', 500, 2, 'Pasar Kita', '1000.00'),
(18, '7-Chessy Pizza', 600, 2, 'Pasar Kita', '1200.00'),
(19, 'Farm Villa Pizza', 500, 3, 'Pasar Kita', '1500.00'),
(19, '7-Chessy Pizza', 600, 3, 'Pasar Kita', '1800.00'),
(19, 'Chessy ham burger', 250, 2, 'Pasar Kita', '500.00'),
(20, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(21, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(22, 'Farm Villa Pizza', 500, 1, 'Pasar Kita', '500.00'),
(23, '7-Chessy Pizza', 600, 2, 'Pasar Kita', '1200.00'),
(23, 'Farm Villa Pizza', 500, 2, 'Pasar Kita', '1000.00'),
(24, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(25, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(26, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(27, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(28, '7-Chessy Pizza', 600, 1, 'Pasar Kita', '600.00'),
(29, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(30, '7-Chessy Pizza', 600, 2, 'Pasar Kita', '1200.00'),
(30, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(30, 'Farm Villa Pizza', 500, 2, 'Pasar Kita', '1000.00'),
(31, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(32, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(33, 'Farm Villa Pizza', 500, 1, 'Pasar Kita', '500.00'),
(34, 'Farm Villa Pizza', 500, 1, 'Pasar Kita', '500.00'),
(34, '7-Chessy Pizza', 600, 1, 'Pasar Kita', '600.00'),
(35, 'Farm Villa Pizza', 500, 1, 'Pasar Kita', '500.00'),
(35, '7-Chessy Pizza', 600, 1, 'Pasar Kita', '600.00'),
(36, 'Jini Roll', 250, 1, 'HK DHOSA', '250.00'),
(37, 'Jini Roll', 250, 3, 'HK DHOSA', '750.00'),
(38, 'Palak Panner', 230, 4, 'HK DHOSA', '920.00'),
(39, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(41, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(41, '7-Chessy Pizza', 600, 1, 'Pasar Kita', '600.00'),
(44, 'Palak Panner', 230, 3, 'HK DHOSA', '690.00'),
(45, 'Jini Roll', 250, 1, 'HK DHOSA', '250.00'),
(46, 'Chessy ham burger', 250, 1, 'HK DHOSA', '250.00'),
(46, 'Palak Panner', 230, 1, 'HK DHOSA', '230.00'),
(48, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(48, 'Palak Panner', 230, 1, 'HK DHOSA', '230.00'),
(49, 'Panner Chesse Pizza', 300, 2, 'Lapinoz Pizza', '600.00'),
(50, 'French Fries', 100, 3, 'Lapinoz Pizza', '300.00'),
(51, 'Kaju-kari', 250, 1, 'Amiras Panjabi Restro', '250.00'),
(51, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(52, 'Kaju-kari', 250, 1, 'Amiras Panjabi Restro', '250.00'),
(53, 'Farm Villa Pizza', 500, 2, 'Pasar Kita', '1000.00'),
(53, '7-Chessy Pizza', 600, 2, 'Pasar Kita', '1200.00'),
(53, 'Kaju-kari', 250, 1, 'Amiras Panjabi Restro', '250.00'),
(54, 'French Fries', 100, 1, 'Lapinoz Pizza', '100.00'),
(55, '7-Chessy Pizza', 600, 1, 'Pasar Kita', '600.00'),
(55, 'Palak Panner', 230, 1, 'HK DHOSA', '230.00'),
(56, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(57, '7-Chessy Pizza', 600, 1, 'Pasar Kita', '600.00'),
(57, 'Farm Villa Pizza', 500, 1, 'Pasar Kita', '500.00'),
(57, 'Jini Roll', 250, 1, 'HK DHOSA', '250.00'),
(57, 'Kaju-kari', 250, 1, 'Amiras Panjabi Restro', '250.00'),
(58, 'Chessy ham burger', 250, 1, 'Pasar Kita', '250.00'),
(58, 'Panner Chesse Pizza', 300, 1, 'Lapinoz Pizza', '300.00');

-- --------------------------------------------------------

--
-- Table structure for table `order_manager`
--

CREATE TABLE `order_manager` (
  `order_id` int(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `cus_name` text NOT NULL,
  `cus_email` varchar(100) NOT NULL,
  `cus_add1` varchar(100) NOT NULL,
  `cus_city` text NOT NULL,
  `cus_phone` bigint(100) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `delivery_boy_name` varchar(255) DEFAULT NULL,
  `payment_status` varchar(100) NOT NULL,
  `order_date` datetime NOT NULL,
  `total_amount` int(11) NOT NULL,
  `transaction_id` varchar(100) NOT NULL,
  `order_status` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `order_manager`
--

INSERT INTO `order_manager` (`order_id`, `username`, `cus_name`, `cus_email`, `cus_add1`, `cus_city`, `cus_phone`, `location`, `delivery_boy_name`, `payment_status`, `order_date`, `total_amount`, `transaction_id`, `order_status`) VALUES
(1, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, NULL, NULL, 'Refunded', '2025-01-20 10:05:58', 250, 'ONL-PAY-RPFQLAUGQA', 'Cancelled'),
(2, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, NULL, NULL, 'Refunded', '2025-01-20 10:32:58', 600, 'ONL-PAY-REZFMC1WJG', 'Cancelled'),
(3, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, NULL, NULL, 'successful', '2025-01-20 10:39:07', 500, 'ONL-PAY-NJ4E4PZPP5', 'Delivered'),
(4, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, NULL, NULL, 'successful', '2025-01-21 05:21:05', 1000, 'ONL-PAY-I0VXHPCS20', 'Delivered'),
(5, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, NULL, NULL, 'successful', '2025-01-21 05:31:37', 1200, 'ONL-PAY-KJD8OAWDVL', 'Delivered'),
(6, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, NULL, NULL, 'successful', '2025-01-21 08:12:28', 1350, 'ONL-PAY-90AG1AMZX1', 'Delivered'),
(7, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, NULL, NULL, 'successful', '2025-01-21 09:12:23', 1350, 'ONL-PAY-OK0FD1B6NH', 'Delivered'),
(8, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, NULL, NULL, 'successful', '2025-01-22 09:53:56', 750, 'ONL-PAY-6739AIC4VX', 'Delivered'),
(9, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, '21.23128442620806,72.90659881360408', NULL, 'successful', '2025-01-22 03:28:06', 600, 'ONL-PAY-7VUR9SU1NS', 'Delivered'),
(10, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, '21.23128442620806,72.90659881360408', NULL, 'successful', '2025-01-22 04:03:58', 1350, 'ONL-PAY-77SZM9T90V', 'Delivered'),
(11, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, '21.231155099776217,72.90679627666597', NULL, 'successful', '2025-01-22 11:33:25', 250, 'ONL-PAY-6790c958ec853', 'Delivered'),
(12, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, '21.23128442620806,72.90659881360408', NULL, 'Refunded', '2025-01-22 11:51:19', 500, 'ONL-PAY-6790cd284ec8d', 'Cancelled'),
(13, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, '21.229693181021037,72.90106449628932', NULL, 'Refunded', '2025-01-24 11:36:09', 480, 'ONL-PAY-67936ceb722b3', 'Cancelled'),
(14, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, '21.213980049587562,72.86403987433448', NULL, 'successful', '2025-01-24 11:42:35', 1080, 'ONL-PAY-67936e7f9b507', 'Delivered'),
(15, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, '21.85923934519646,72.93081277892213', 'tarun', 'successful', '2025-01-25 05:19:47', 250, 'ONL-PAY-679466478cc91', 'Delivered'),
(16, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, '22.237566633557687,73.22772391289223', 'tarun', 'successful', '2025-01-25 07:14:55', 500, 'ONL-PAY-6794813c50318', 'Delivered'),
(17, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, '22.262409564319125,73.21184679710433', 'kenil', 'successful', '2025-01-25 13:08:41', 600, 'ONL-PAY-6794d436af0b6', 'Delivered'),
(18, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, '22.337200763858036,73.12349843151243', 'tarun', 'successful', '2025-01-26 05:49:59', 2200, 'ONL-PAY-6795bed4a7d17', 'Delivered'),
(19, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, '21.181501564507172,72.84733865989983', 'kenil', 'successful', '2025-01-26 05:56:08', 3800, 'ONL-PAY-6795c0402caaa', 'Delivered'),
(20, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, '21.209773777630705,72.85004095886143', 'tarun', 'successful', '2025-01-26 14:08:52', 250, 'ONL-PAY-679633cb17e31', 'Delivered'),
(21, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, '21.2301328,72.9008193', 'tarun', 'successful', '2025-01-27 03:16:09', 250, 'ONL-PAY-6796ec497679c', 'Delivered'),
(22, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, '21.236469661329615,72.85415802133005', 'kenil', 'successful', '2025-01-27 03:18:47', 500, 'ONL-PAY-6796ecf0bac92', 'Delivered'),
(23, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, '21.208784480956474,72.85033411858169', 'tarun', 'successful', '2025-01-27 03:51:23', 2200, 'ONL-PAY-6796f48f13a3f', 'Delivered'),
(24, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, '21.2301328,72.9008193', 'kenil', 'successful', '2025-01-27 11:41:54', 250, 'ONL-PAY-679762d76c0ab', 'Delivered'),
(25, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, '21.2301328,72.9008193', NULL, 'Refunded', '2025-01-27 11:50:09', 250, 'ONL-PAY-679764c901f0b', 'Cancelled'),
(26, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, '21.403357733898854,72.92021724150526', NULL, 'Refunded', '2025-01-27 11:56:27', 250, 'ONL-PAY-679766483225c', 'Cancelled'),
(27, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, '21.2301328,72.9008193', 'dhruvil', 'successful', '2025-01-27 12:03:14', 250, 'ONL-PAY-679767e032d72', 'Delivered'),
(28, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, '21.228031004453758,72.89460932732217', 'dhruvil', 'successful', '2025-01-28 05:48:20', 600, 'ONL-PAY-6798617b9e4ab', 'Delivered'),
(29, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, '21.231098508630343,72.86227586086008', 'dhruvil', 'successful', '2025-01-28 15:18:54', 200, 'ONL-PAY-6798e7315cc60', 'Delivered'),
(30, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, '21.2301328,72.9008193', 'dhruvil', 'successful', '2025-01-29 06:14:01', 2450, 'ONL-PAY-6799b908080ea', 'Delivered'),
(31, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, '21.5406539426734,73.20867841719478', 'dhruvil', 'successful', '2025-01-29 11:03:41', 250, 'ONL-PAY-6799fcedf11a7', 'Delivered'),
(32, 'juhil', 'juhil desai', 'juhildesai@gmail.com', 'B-56,57 maruti dham society , amroli , surat -395006', 'Surat', 9265301452, '21.2375488,72.8505771', 'dhruvil', 'successful', '2025-01-29 16:04:45', 250, 'ONL-PAY-679a43628da3b', 'Delivered'),
(33, 'juhil', 'juhil desai', 'juhildesai@gmail.com', 'B-56,57 maruti dham society , amroli , surat -395006', 'Surat', 9265301452, '21.2301328,72.9008193', 'utsav', 'successful', '2025-01-30 04:57:18', 500, 'ONL-PAY-679af88734f62', 'Delivered'),
(34, 'kunal', '', 'kunal12@gmail.com', '', '', 0, '21.2375488,72.8505771', NULL, 'Refunded', '2025-02-15 12:25:16', 880, 'ONL-PAY-67b0796050087', 'Cancelled'),
(35, 'kunal', 'kunal pipeliya', 'kunal12@gmail.com', 'kuber nagar,simada', 'surat', 9562347851, '21.2158965,72.8629914', 'dixit', 'successful', '2025-02-15 12:27:50', 880, 'ONL-PAY-67b07a1641815', 'Delivered'),
(36, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, '21.2375488,72.8505771', NULL, 'Refunded', '2025-02-17 14:52:27', 250, 'ONL-PAY-67b33f0670e89', 'Cancelled'),
(37, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, '21.2375488,72.8505771', 'utsav', 'successful', '2025-02-17 15:22:12', 750, 'ONL-PAY-67b345ff92fce', 'Delivered'),
(38, 'juhil', 'juhil desai', 'juhildesai@gmail.com', 'B-56,57 maruti dham society , amroli , surat -395006', 'Surat', 9265301452, '21.2375488,72.8505771', 'utsav', 'successful', '2025-02-20 07:04:12', 920, 'ONL-PAY-67b6c5c3581c4', 'Delivered'),
(39, 'juhil', 'juhil desai', 'juhildesai@gmail.com', 'B-56,57 maruti dham society , amroli , surat -395006', 'Surat', 9265301452, '21.2375488,72.8505771', 'utsav', 'successful', '2025-02-20 07:38:33', 200, 'ONL-PAY-67b6cdd278487', 'Delivered'),
(40, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, '21.2375488,72.8505771', NULL, 'Refunded', '2025-02-20 15:32:51', 850, 'ONL-PAY-67b73b0f78728', 'Cancelled'),
(41, 'kenil', 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, '21.2375488,72.8505771', NULL, 'Refunded', '2025-02-20 15:35:12', 850, 'ONL-PAY-67b73d6ef418f', 'Cancelled'),
(42, 'juhil', 'juhil desai', 'juhildesai@gmail.com', 'B-56,57 maruti dham society , amroli , surat -395006', 'Surat', 9265301452, '21.2158965,72.8629914', NULL, 'Refunded', '2025-02-20 18:37:41', 690, 'ONL-PAY-67b76850c058f', 'Cancelled'),
(43, 'juhil', 'juhil desai', 'juhildesai@gmail.com', 'B-56,57 maruti dham society , amroli , surat -395006', 'Surat', 9265301452, '21.2375488,72.8505771', NULL, 'Refunded', '2025-02-20 18:38:55', 460, 'ONL-PAY-67b768a006151', 'Cancelled'),
(44, 'juhil', 'juhil desai', 'juhildesai@gmail.com', 'B-56,57 maruti dham society , amroli , surat -395006', 'Surat', 9265301452, '21.2375488,72.8505771', 'utsav', 'successful', '2025-02-20 18:42:17', 690, 'ONL-PAY-67b7696a1ca9d', 'Delivered'),
(45, 'juhil', 'juhil desai', 'juhildesai@gmail.com', 'B-56,57 maruti dham society , amroli , surat -395006', 'Surat', 9265301452, '21.2375488,72.8505771', NULL, 'Refunded', '2025-02-20 18:53:12', 250, 'ONL-PAY-67b76bf3c757b', 'Cancelled'),
(46, 'juhil', 'juhil desai', 'juhildesai@gmail.com', 'B-56,57 maruti dham society , amroli , surat -395006', 'Surat', 9265301452, '21.2301328,72.9008193', NULL, 'Refunded', '2025-02-20 18:56:04', 480, 'ONL-PAY-67b76ca093475', 'Cancelled'),
(47, 'juhil', 'juhil desai', 'juhildesai@gmail.com', 'B-56,57 maruti dham society , amroli , surat -395006', 'Surat', 9265301452, '21.2375488,72.8505771', NULL, 'Refunded', '2025-02-20 19:01:21', 480, 'ONL-PAY-67b76d755cbb4', 'Cancelled'),
(48, 'juhil', 'juhil desai', 'juhildesai@gmail.com', 'B-56,57 maruti dham society , amroli , surat -395006', 'Surat', 9265301452, '21.2301328,72.9008193', NULL, 'Refunded', '2025-02-20 19:12:15', 480, 'ONL-PAY-67b77064a03e7', 'Cancelled'),
(49, 'juhil', 'juhil desai', 'juhildesai@gmail.com', 'B-56,57 maruti dham society , amroli , surat -395006', 'Surat', 9265301452, '21.2375488,72.8505771', 'utsav', 'successful', '2025-02-20 19:42:36', 600, 'ONL-PAY-67b7778b14e88', 'Delivered'),
(50, 'juhil', 'juhil desai', 'juhildesai@gmail.com', 'B-56,57 maruti dham society , amroli , surat -395006', 'Surat', 9265301452, '21.2375488,72.8505771', 'utsav', 'successful', '2025-02-21 05:56:05', 300, 'ONL-PAY-67b807508432b', 'Delivered'),
(51, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, '21.2375488,72.8505771', 'utsav', 'successful', '2025-02-22 05:15:02', 500, 'ONL-PAY-67b94f30e2ffd', 'Delivered'),
(52, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, '21.2375488,72.8505771', NULL, 'Refunded', '2025-02-22 08:20:53', 250, 'ONL-PAY-67b97abfd99f8', 'Cancelled'),
(53, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, '21.2301328,72.9008193', 'utsav', 'successful', '2025-02-22 11:56:51', 2450, 'ONL-PAY-67b9ad5ada5b2', 'Delivered'),
(54, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, '21.2301328,72.9008193', NULL, 'Refunded', '2025-02-24 14:14:55', 100, 'ONL-PAY-67bc3174af773', 'Cancelled'),
(55, 'juhil', 'juhil desai', 'juhildesai@gmail.com', 'B-56,57 maruti dham society , amroli , surat -395006', 'Surat', 9265301452, '', NULL, 'Refunded', '2025-03-15 18:53:46', 830, 'ONL-PAY-67d57f5c5c96c', 'Cancelled'),
(56, 'juhil', 'juhil desai', 'juhildesai@gmail.com', 'B-56,57 maruti dham society , amroli , surat -395006', 'Surat', 9265301452, '21.2375488,72.8505771', NULL, 'cod', '2025-03-15 18:56:48', 250, 'ONL-PAY-67d58010320dd', 'Processing'),
(57, 'prince', 'prince gangani', 'princeg@gmail.com', 'swati heigts, near ring-road, surat', 'surat', 9562375421, '21.2301328,72.9008193', NULL, 'successful', '2025-03-20 18:27:36', 1280, 'ONL-PAY-67dc10a87869a', 'Pending'),
(58, 'tarun', 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, '21.2375488,72.8505771', 'jay', 'successful', '2025-03-20 22:22:50', 440, 'ONL-PAY-67dc47c401228', 'Delivered');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_admin`
--

CREATE TABLE `tbl_admin` (
  `id` int(10) UNSIGNED NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tbl_admin`
--

INSERT INTO `tbl_admin` (`id`, `full_name`, `email`, `username`, `password`) VALUES
(1, 'admin', 'admin@example.com', 'admin', '21232f297a57a5a743894a0e4a801fc3'),
(2, 'Admin Two', 'admin2@example.com', 'admin2', '$2y$12$w1p/GeCD9RHU3wA10FX5/e0cH9xbfpQEPH0gCGOYcvDRiuEmyaEWq');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_category`
--

CREATE TABLE `tbl_category` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(100) NOT NULL,
  `image_name` varchar(255) NOT NULL,
  `featured` varchar(10) NOT NULL,
  `active` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tbl_category`
--

INSERT INTO `tbl_category` (`id`, `title`, `image_name`, `featured`, `active`) VALUES
(1, 'Pizza', 'Food_Category_693.jpg', 'No', 'Yes'),
(2, 'Burger', 'Food_Category_51022.jpg', 'Yes', 'Yes');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_coupon`
--

CREATE TABLE `tbl_coupon` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `coupon_code` varchar(100) NOT NULL,
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','inactive') NOT NULL,
  `discount` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `tbl_coupon`
--

INSERT INTO `tbl_coupon` (`id`, `name`, `coupon_code`, `created_date`, `status`, `discount`) VALUES
(1, 'For new users only', 'SAVE20', '2025-01-24 15:31:40', 'active', '20.00');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_delivery_boy`
--

CREATE TABLE `tbl_delivery_boy` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile_number` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `user_role` tinyint(1) NOT NULL COMMENT '0 = Blocked, 1 = Active',
  `status` enum('verified','not_verified') DEFAULT 'not_verified',
  `adhar_image` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reset_key` int(6) UNSIGNED ZEROFILL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `tbl_delivery_boy`
--

INSERT INTO `tbl_delivery_boy` (`id`, `name`, `username`, `email`, `mobile_number`, `password`, `user_role`, `status`, `adhar_image`, `address`, `created_at`, `updated_at`, `reset_key`) VALUES
(1, 'tarun', 'tarun', 'vaghanitarun13@gmail.com', '9978043407', '$2y$10$Xat9fiqJdXQu8IdiXmQNfOHymb3yiU5/phdF5Er0Iovv3rZxMnNxC', 1, 'verified', 'uploads/Screenshot 2022-01-31 121034.png', 'D-404, merigold residency ', '2025-01-22 14:31:58', '2025-03-15 13:43:25', 755378),
(2, 'kenil', 'kenil', 'kenilmaniya@gmail.com', '9582632552', '$2y$10$5duns3sedk3N2AKhcOeViuZYaA6pH58M3ZIRAWQbvs6s6fqcNaE6.', 1, 'verified', 'uploads/Screenshot 2022-01-31 121034.png', 'A.34 Madhuwan Society\r\nSociety', '2025-01-22 14:38:06', '2025-01-25 04:57:03', NULL),
(3, 'dhruvil ghevariya', 'dhruvil', 'dhruvil12@gmail.com', '9316353828', '$2y$10$JnwTzNSh6gHNZ9L59VtNL.m0cslGNo.BUduzpHAlG6kQQwk/Up51u', 1, 'verified', 'uploads/Screenshot 2023-03-07 083254.png', 'A-56 gangotri society near nana varachaa , surat', '2025-01-27 02:54:25', '2025-01-28 04:47:02', NULL),
(4, 'utsav', 'utsav', 'utsav12@gmail.com', '9756843654', '$2y$10$5iujN5YiqxEBfp9FKw6DdOwTlYK5e2kl32DxdqmzJnzoKsWT2OIwi', 1, 'verified', 'uploads/WhatsApp Image 2024-10-04 at 8.50.18 PM.jpeg', 'sarthana', '2025-01-30 03:58:18', '2025-02-20 15:29:22', NULL),
(5, 'Jay vasani', 'jay', 'jay12@gmail.com', '9856245162', '$2y$10$Htb0qhU2mgKjTOW7UMRNH.hrkI8hu8CsJAeyctfUup/CiGa9d89kO', 1, 'verified', 'uploads/H K DHOSA_page-0008.jpg', 'vaikunth residency, mota varachaa', '2025-03-20 16:55:06', '2025-03-20 16:55:28', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_delivery_payment`
--

CREATE TABLE `tbl_delivery_payment` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `salary` decimal(10,2) NOT NULL,
  `payment_status` enum('paid','unpaid') DEFAULT 'unpaid',
  `order_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `tbl_delivery_payment`
--

INSERT INTO `tbl_delivery_payment` (`id`, `username`, `salary`, `payment_status`, `order_id`, `created_at`) VALUES
(1, 'tarun', '30.00', 'paid', 16, '2025-01-25 08:08:06'),
(2, 'kenil', '30.00', 'paid', 17, '2025-01-25 13:10:18'),
(3, 'tarun', '60.00', 'paid', 18, '2025-01-26 05:51:16'),
(4, 'kenil', '60.00', 'paid', 19, '2025-01-26 06:01:57'),
(5, 'tarun', '25.00', 'paid', 20, '2025-01-26 14:09:29'),
(6, 'tarun', '25.00', 'paid', 21, '2025-01-27 03:16:56'),
(7, 'kenil', '30.00', 'paid', 22, '2025-01-27 03:19:13'),
(8, 'tarun', '60.00', 'paid', 23, '2025-01-27 03:52:33'),
(9, 'kenil', '25.00', 'paid', 24, '2025-01-27 11:42:38'),
(10, 'dhruvil', '25.00', 'paid', 27, '2025-01-27 12:04:12'),
(11, 'dhruvil', '30.00', 'paid', 28, '2025-01-28 05:50:21'),
(12, 'dhruvil', '20.00', 'paid', 29, '2025-01-28 15:28:26'),
(13, 'dhruvil', '60.00', 'paid', 30, '2025-01-29 10:45:22'),
(14, 'dhruvil', '25.00', 'paid', 31, '2025-01-29 11:19:21'),
(15, 'dhruvil', '25.00', 'paid', 32, '2025-01-29 16:08:04'),
(16, 'utsav', '30.00', 'paid', 33, '2025-01-30 04:58:52'),
(17, 'utsav', '30.00', 'paid', 37, '2025-02-17 15:22:46'),
(18, 'utsav', '30.00', 'unpaid', 38, '2025-02-20 07:06:09'),
(19, 'utsav', '20.00', 'unpaid', 39, '2025-02-20 07:39:09'),
(20, 'utsav', '30.00', 'unpaid', 44, '2025-02-20 18:48:06'),
(21, 'utsav', '30.00', 'unpaid', 49, '2025-02-20 19:44:42'),
(22, 'utsav', '25.00', 'unpaid', 50, '2025-02-21 05:57:02'),
(23, 'utsav', '30.00', 'unpaid', 51, '2025-02-22 05:18:57'),
(24, 'utsav', '60.00', 'unpaid', 53, '2025-02-22 11:58:07'),
(25, 'jay', '25.00', 'unpaid', 58, '2025-03-20 17:56:32');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_eipay`
--

CREATE TABLE `tbl_eipay` (
  `id` int(10) UNSIGNED NOT NULL,
  `table_id` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `tran_id` varchar(50) NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `payment_status` varchar(50) NOT NULL,
  `order_status` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_fest_coupon`
--

CREATE TABLE `tbl_fest_coupon` (
  `id` int(11) NOT NULL,
  `festival_name` varchar(255) NOT NULL,
  `coupon_code` varchar(50) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `duration` int(11) NOT NULL COMMENT 'Duration in days',
  `expire` varchar(20) NOT NULL DEFAULT 'active',
  `status` varchar(20) NOT NULL,
  `discount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_fest_coupon`
--

INSERT INTO `tbl_fest_coupon` (`id`, `festival_name`, `coupon_code`, `created_date`, `duration`, `expire`, `status`, `discount`) VALUES
(1, 'Holi', 'HOLI@14', '2025-03-07 14:47:44', 7, 'active', 'active', '20.00');

--
-- Triggers `tbl_fest_coupon`
--
DELIMITER $$
CREATE TRIGGER `update_expire_status` BEFORE INSERT ON `tbl_fest_coupon` FOR EACH ROW BEGIN
    IF NOW() > DATE_ADD(NEW.created_date, INTERVAL NEW.duration DAY) THEN
        SET NEW.expire = 'expired';
    ELSE
        SET NEW.expire = 'active';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_expire_status_on_update` BEFORE UPDATE ON `tbl_fest_coupon` FOR EACH ROW BEGIN
    IF NOW() > DATE_ADD(NEW.created_date, INTERVAL NEW.duration DAY) THEN
        SET NEW.expire = 'expired';
    ELSE
        SET NEW.expire = 'active';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_food`
--

CREATE TABLE `tbl_food` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `restro_name` varchar(255) NOT NULL DEFAULT 'Pasar Kita',
  `image_name` varchar(255) NOT NULL,
  `category_id` int(10) UNSIGNED NOT NULL,
  `featured` varchar(10) NOT NULL,
  `active` varchar(10) NOT NULL,
  `stock` int(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tbl_food`
--

INSERT INTO `tbl_food` (`id`, `title`, `description`, `price`, `restro_name`, `image_name`, `category_id`, `featured`, `active`, `stock`) VALUES
(1, '7-Chessy Pizza', 'Made with the 7 diffrent diffrent chesse', '600.00', 'Pasar Kita', 'Food-Name-9503.jpg', 1, 'Yes', 'Yes', 54),
(2, 'Chessy ham burger', 'burger with the lots of chesse', '250.00', 'Pasar Kita', 'Food-Name-1317.jpg', 2, 'Yes', 'Yes', 53),
(3, 'Farm Villa Pizza', 'Made with lots of  vaggies', '500.00', 'Pasar Kita', 'Food-Name-1242.jpg', 1, 'Yes', 'Yes', 133);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_order`
--

CREATE TABLE `tbl_order` (
  `id` int(10) UNSIGNED NOT NULL,
  `transaction_id` varchar(150) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `order_date` datetime NOT NULL,
  `status` varchar(50) NOT NULL,
  `customer_name` varchar(150) NOT NULL,
  `customer_contact` varchar(20) NOT NULL,
  `customer_email` varchar(150) NOT NULL,
  `customer_address` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_rcategory_notapproved`
--

CREATE TABLE `tbl_rcategory_notapproved` (
  `cid` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `image_name` varchar(255) DEFAULT NULL,
  `featured` enum('Yes','No') NOT NULL DEFAULT 'No',
  `active` enum('Yes','No') NOT NULL DEFAULT 'No',
  `status` enum('not_approved','approved') NOT NULL DEFAULT 'not_approved',
  `restro_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_rcategory_notapproved`
--

INSERT INTO `tbl_rcategory_notapproved` (`cid`, `title`, `image_name`, `featured`, `active`, `status`, `restro_name`, `created_at`) VALUES
(1, 'Fancy Dhosa', 'Food_Category_251.jpeg', 'Yes', 'Yes', 'approved', 'HK DHOSA', '2025-02-16 11:36:18'),
(2, 'Paper', 'Food_Category_13641.jpeg', 'Yes', 'Yes', 'approved', 'HK DHOSA', '2025-02-16 16:03:25'),
(3, 'Veg Pizza', 'Food_Category_42816.jpg', 'Yes', 'Yes', 'approved', 'Lapinoz Pizza', '2025-02-20 18:34:39'),
(4, 'Punjabi', 'Food_Category_6127.jpg', 'Yes', 'Yes', 'approved', 'Amiras Panjabi Restro', '2025-02-22 04:11:03'),
(5, 'Punjabi', 'Food_Category_533.jpg', 'Yes', 'Yes', 'approved', 'Lemon', '2025-03-20 17:01:53');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_restro`
--

CREATE TABLE `tbl_restro` (
  `id` int(11) NOT NULL,
  `restro_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `restro_address` text NOT NULL,
  `mobile_no` varchar(15) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `food_licence_image` varchar(255) NOT NULL,
  `restro_image` varchar(255) NOT NULL,
  `user_role` tinyint(1) DEFAULT '1',
  `status` enum('not_approved','approved') DEFAULT 'not_approved',
  `reset_key` char(6) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_restro`
--

INSERT INTO `tbl_restro` (`id`, `restro_name`, `username`, `restro_address`, `mobile_no`, `email`, `password`, `food_licence_image`, `restro_image`, `user_role`, `status`, `reset_key`, `created_at`) VALUES
(1, 'HK DHOSA', 'hk', 'hk dhosa, opposite ananta heights , mota varachaa , surat', '9316353828', 'hkdhosa@gmail.com', '$2y$10$jrMW3oBmbzYEjOIXL3wdpe9bDZQpDdau2xaVH5Lbkrrs6RsUeAasC', 'uploads/licence/food-licence.jpg', 'uploads/restro-img/WhatsApp Image 2025-02-16 at 12.08.52 PM.jpeg', 1, 'approved', '222424', '2025-02-16 06:45:23'),
(2, 'Lapinoz Pizza', 'lapinoz', 'A-85,86 , avadh business hub , jakatnaka , surat', '9913787785', 'lapinoz-p@gmail.com', '$2y$10$Q6xUls9QcEk0yMCYUx2cver5BttmVBMmI0IS.kqUpSkyUX1U7/BuK', 'uploads/licence/H K DHOSA_page-0005.jpg', 'uploads/restro-img/pizza-3007395_1920.jpg', 1, 'approved', '', '2025-02-18 05:18:53'),
(3, 'Amiras Panjabi Restro', 'amiras', 'Jakatnaka , surat', '8563241252', 'amiras@gmail.com', '$2y$10$rfbvjzQzV0yPsKED4AcPiO3YybK9VXMEZ3PxPFsVg09.N/P0mDy5y', 'uploads/licence/food-licence.jpg', 'uploads/restro-img/WhatsApp Image 2025-02-22 at 8.35.28 AM.jpeg', 1, 'approved', '', '2025-02-22 04:10:00'),
(4, 'Lemon', 'lemon', 'Sunday business hub, mota varachaa.', '9854125632', 'lemonpubjabi@gmail.com', '$2y$10$XKS5h.EPN4QFuCOhvR4mWO8nftwmE3GSdKtQycj/S2/SLP8E.18fy', 'uploads/licence/food-licence.jpg', 'uploads/restro-img/lemon.png', 1, 'approved', '', '2025-03-20 17:00:16');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_restro_food_item`
--

CREATE TABLE `tbl_restro_food_item` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_name` varchar(255) DEFAULT NULL,
  `restro_name` varchar(255) NOT NULL,
  `cid` int(11) NOT NULL,
  `featured` enum('Yes','No') NOT NULL DEFAULT 'No',
  `active` enum('Yes','No') NOT NULL DEFAULT 'Yes',
  `stock` int(11) NOT NULL DEFAULT '0',
  `status` enum('approved','not_approved') DEFAULT 'not_approved'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_restro_food_item`
--

INSERT INTO `tbl_restro_food_item` (`id`, `title`, `description`, `price`, `image_name`, `restro_name`, `cid`, `featured`, `active`, `stock`, `status`) VALUES
(2, 'Jini Roll', 'A Dhosa paper with capsicum , onion , tamato , chesse and panner.', '250.00', 'Food-Name-8060.jpeg', 'HK DHOSA', 1, 'Yes', 'Yes', 69, 'approved'),
(3, 'Palak Panner', 'A Dhosa paper with the palak and panner .', '230.00', 'Food-1792.jpeg', 'HK DHOSA', 1, 'Yes', 'Yes', 55, 'approved'),
(4, 'Panner Chesse Pizza', 'A pizza with the pannerand chesse.', '300.00', 'Food-6198.jpg', 'Lapinoz Pizza', 3, 'Yes', 'Yes', 79, 'approved'),
(5, 'French Fries', 'Made with the potato and serve with souce.', '100.00', 'Food-7735.jpg', 'Lapinoz Pizza', 3, 'Yes', 'Yes', 59, 'approved'),
(6, 'Kaju-kari', 'A shak with the kauj masala', '250.00', 'Food-8202.jpg', 'Amiras Panjabi Restro', 4, 'Yes', 'Yes', 52, 'approved'),
(7, 'Panner Masala', 'Panner masala', '250.00', 'Food-Name-6292.jpg', 'Lemon', 5, 'Yes', 'Yes', 70, 'approved');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_review`
--

CREATE TABLE `tbl_review` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `order_id` int(11) NOT NULL,
  `message` text,
  `review_star` int(11) DEFAULT NULL,
  `tip` decimal(10,2) NOT NULL DEFAULT '0.00',
  `username` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `tbl_review`
--

INSERT INTO `tbl_review` (`id`, `name`, `order_id`, `message`, `review_star`, `tip`, `username`, `created_at`) VALUES
(1, 'tarun', 16, 'very humble person', 5, '0.00', 'tarun vaghani', '2025-01-25 11:49:41'),
(2, 'kenil', 17, 'really good service', 5, '0.00', 'tarun vaghani', '2025-01-25 12:10:49'),
(3, 'kenil', 19, 'worth it as compare to price', 4, '0.00', 'kenil maniya', '2025-01-26 05:02:39'),
(4, 'tarun', 20, 'testing', 5, '0.00', 'kenil maniya', '2025-01-26 13:09:50'),
(5, 'tarun', 21, 'totally worth it !!!!', 5, '0.00', 'tarun vaghani', '2025-01-27 02:17:34'),
(6, 'kenil', 22, 'right time delivery thank  you pasar-kita ', 5, '0.00', 'kenil maniya', '2025-01-27 02:19:49'),
(7, 'tarun', 18, 'worth it , good quality', 5, '0.00', 'kenil maniya', '2025-01-27 02:46:45'),
(8, 'tarun', 23, 'I liked the packing of the food', 5, '0.00', 'kenil maniya', '2025-01-27 03:00:06'),
(9, 'kenil', 24, 'sweet person', 5, '0.00', 'tarun vaghani', '2025-01-27 10:43:17'),
(10, 'dhruvil', 27, 'nice guy and the food quality was so good ', 5, '0.00', 'kenil maniya', '2025-01-27 11:04:53'),
(11, 'dhruvil', 28, 'nice food quality', 5, '0.00', 'kenil maniya', '2025-01-28 04:50:43'),
(12, 'dhruvil', 29, 'Excellent service! The delivery boy was friendly and handled the items with care.', 5, '0.00', 'kenil maniya', '2025-01-28 14:30:15'),
(13, 'dhruvil', 30, 'i really enjoy your food \r\n', 5, '0.00', 'tarun vaghani', '2025-01-29 09:52:54'),
(14, 'dhruvil', 31, 'fully satisfying food', 5, '0.00', 'kenil maniya', '2025-01-29 10:20:08'),
(15, 'dhruvil', 32, 'right time delivery', 5, '0.00', 'juhil desai', '2025-01-29 15:08:32'),
(16, 'utsav', 33, 'hello', 5, '20.00', 'juhil desai', '2025-01-30 03:59:03'),
(18, 'utsav', 37, 'very humble person', 5, '30.00', 'tarun vaghani', '2025-02-17 14:28:01'),
(19, 'utsav', 38, 'Nice Dhosa', 5, '10.00', 'juhil desai', '2025-02-20 06:06:44'),
(20, 'utsav', 44, 'nice dhosa', 5, '0.00', 'juhil desai', '2025-02-20 17:48:36'),
(21, 'utsav', 51, 'nice', 5, '20.00', 'tarun vaghani', '2025-02-22 04:19:18'),
(22, 'jay', 58, 'very humble person', 5, '10.00', 'tarun vaghani', '2025-03-20 16:57:02');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_review_restro`
--

CREATE TABLE `tbl_review_restro` (
  `id` int(11) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `restro_name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `rating_star` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `tbl_review_restro`
--

INSERT INTO `tbl_review_restro` (`id`, `customer_name`, `restro_name`, `description`, `rating_star`, `created_at`) VALUES
(1, 'juhil desai', 'HK DHOSA', 'Nice Dhosa speically their chutney.', 5, '2025-02-21 07:23:33'),
(2, 'tarun vaghani', 'Amiras Panjabi Restro', ' nice punjabi food', 5, '2025-02-22 04:17:49');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE `tbl_users` (
  `id` int(11) NOT NULL,
  `name` text NOT NULL,
  `email` varchar(100) NOT NULL,
  `add1` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `phone` bigint(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `reset_key` varchar(255) DEFAULT NULL,
  `user_role` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tbl_users`
--

INSERT INTO `tbl_users` (`id`, `name`, `email`, `add1`, `city`, `phone`, `username`, `password`, `reset_key`, `user_role`) VALUES
(1, 'tarun vaghani', 'vaghanitarun13@gmail.com', 'D-404, Merigold Residency , Near v.t. circle', 'surat', 9978043407, 'tarun', '$2y$10$N.01LGZftm9tR8nczMwTy.wBugr1fFtx99Beeuitky.kott4QdhJ6', '339591', 1),
(2, 'kenil maniya', 'kenilmaniya02@gmail.com', 'c-801 , saarthi residency ,mota varachaa', 'surat', 9578523189, 'kenil', '$2y$10$fM0a2SIjnKdwadur5/YeaeHOzha4gY4db4HJlsxudUTtHTGK2fuF6', NULL, 1),
(4, 'juhil desai', 'juhildesai@gmail.com', 'B-56,57 maruti dham society , amroli , surat -395006', 'Surat', 9265301452, 'juhil', '$2y$10$820eOLbUVnRXXOnYshz5p.pcyYNPFcs9wDmFB9hIaZjR19FGCCPfO', '981447', 1),
(5, 'kunal pipeliya', 'kunal12@gmail.com', '82 , kuber nagar, simada naka, surat', 'surat', 9562384521, 'kunal', '$2y$10$re7FtgTkEhTJG3Nfc7ItE.fj/mk.oGyQaeJzwkFLOoDsgVw.e0obe', NULL, 1),
(6, 'prince gangani', 'princeg@gmail.com', 'swati heigts, near ring-road, surat', 'surat', 9562375421, 'prince', '$2y$10$EXH/st/aQPwhjnHUVunoTOySqrzf1lZ8hoiAqVO3aPr6b1ujGylSm', NULL, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `aamarpay`
--
ALTER TABLE `aamarpay`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_manager`
--
ALTER TABLE `order_manager`
  ADD PRIMARY KEY (`order_id`);

--
-- Indexes for table `tbl_admin`
--
ALTER TABLE `tbl_admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_category`
--
ALTER TABLE `tbl_category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_coupon`
--
ALTER TABLE `tbl_coupon`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_delivery_boy`
--
ALTER TABLE `tbl_delivery_boy`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_delivery_payment`
--
ALTER TABLE `tbl_delivery_payment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `tbl_fest_coupon`
--
ALTER TABLE `tbl_fest_coupon`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_food`
--
ALTER TABLE `tbl_food`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_order`
--
ALTER TABLE `tbl_order`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_rcategory_notapproved`
--
ALTER TABLE `tbl_rcategory_notapproved`
  ADD PRIMARY KEY (`cid`);

--
-- Indexes for table `tbl_restro`
--
ALTER TABLE `tbl_restro`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `tbl_restro_food_item`
--
ALTER TABLE `tbl_restro_food_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cid` (`cid`);

--
-- Indexes for table `tbl_review`
--
ALTER TABLE `tbl_review`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `tbl_review_restro`
--
ALTER TABLE `tbl_review_restro`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `aamarpay`
--
ALTER TABLE `aamarpay`
  MODIFY `id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `message`
--
ALTER TABLE `message`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `order_manager`
--
ALTER TABLE `order_manager`
  MODIFY `order_id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `tbl_admin`
--
ALTER TABLE `tbl_admin`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_category`
--
ALTER TABLE `tbl_category`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_coupon`
--
ALTER TABLE `tbl_coupon`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_delivery_boy`
--
ALTER TABLE `tbl_delivery_boy`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tbl_delivery_payment`
--
ALTER TABLE `tbl_delivery_payment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `tbl_fest_coupon`
--
ALTER TABLE `tbl_fest_coupon`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbl_rcategory_notapproved`
--
ALTER TABLE `tbl_rcategory_notapproved`
  MODIFY `cid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tbl_restro`
--
ALTER TABLE `tbl_restro`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tbl_restro_food_item`
--
ALTER TABLE `tbl_restro_food_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tbl_review`
--
ALTER TABLE `tbl_review`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `tbl_review_restro`
--
ALTER TABLE `tbl_review_restro`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbl_restro_food_item`
--
ALTER TABLE `tbl_restro_food_item`
  ADD CONSTRAINT `tbl_restro_food_item_ibfk_1` FOREIGN KEY (`cid`) REFERENCES `tbl_rcategory_notapproved` (`cid`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
