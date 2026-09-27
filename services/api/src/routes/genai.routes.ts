import { Router, Request, Response } from 'express';
import { GenAIService } from '../services/genai.service';

export const genaiRouter = Router();

genaiRouter.post('/copilot', async (req: Request, res: Response) => {
  try {
    const { prompt, serviceCategory } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    const responseText = await GenAIService.getCustomerCopilotAdvice(prompt, serviceCategory || 'RIDE');
    return res.json({ success: true, data: { answer: responseText } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

genaiRouter.get('/dispatch-insights', async (req: Request, res: Response) => {
  try {
    const insights = await GenAIService.analyzeCityDispatchInsights();
    return res.json({ success: true, data: insights });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
