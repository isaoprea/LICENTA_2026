import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai'; 

@Injectable()
export class AiService {
  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
private model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
 async cereAjutor(problema: string, cod: string, eroare: string) {
    console.log("--- Apel Mentor AI pentru problema:", problema, "---");
    
    try {
      const prompt = `Ești un mentor de programare. Utilizatorul are o eroare la problema "${problema}". 
      Codul lui: 
      ${cod}
      
      Eroarea de la compilator: 
      ${eroare}
      
      Explică-i scurt în limba română unde este greșeala logică, fără să-i dai codul corect. Fii scurt (maxim 3-4 propoziții).`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err: any) {
      console.error("EROARE REALA GOOGLE:", err);
      return "Mentorul are o mică problemă tehnică de conexiune cu Google. Încearcă peste un minut.";
    }
  }
}