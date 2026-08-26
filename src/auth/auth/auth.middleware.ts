import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class AuthMiddleware implements NestMiddleware {

  constructor(private JwtService:JwtService){

  }

  use(req: any, res: any, next: () => void) {

    //grabe the header forauthorization
    //bearer token 
    //greb the header and check them 

    const authHeader=req.headers.authorization
    if (!authHeader){
      return res.status(401).json({msg:"failed to authentication"})
    }
    
    //now check formate 
    if (authHeader.split(" ")[0]!=="Bearer"){
      return res.status(403).json({msg:"failed to authentication"})
    }
    
    //now get token and checkm in the jwt token
    
    try {
      
      const bearerToken=authHeader.split(" ")[1]
  
      //now rehash the jwt token
      const decodedToken = this.JwtService.verify(bearerToken)

      
  
      req.user={id:decodedToken.userId}
      next();
    } catch (error) {
      return res.status(403).json({msg:"failed to authentication"})
    }


  }
}
