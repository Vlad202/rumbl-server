import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import redisClient from '../config/redisConfig.js';

const TOKEN_EXPIRATION_TIME = 60 * 60; // 1 час

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  try {
    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);
    await saveToken(user._id, token);
    res.status(201).json({ success: true, token });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    await saveToken(user._id, token);
    res.status(200).json({ success: true, token });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  const userId = req.user.id;
  try {
    await redisClient.del(`auth:${userId}`);
    res.status(200).json({ success: true, message: 'Logged out from current device' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const logoutAll = async (req: Request, res: Response) => {
  const userId = req.user.id;
  try {
    await redisClient.del(`auth:${userId}`);
    res.status(200).json({ success: true, message: 'Logged out from all devices' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Функция для генерации JWT токена
const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRE
