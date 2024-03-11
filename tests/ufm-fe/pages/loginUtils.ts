import { LoginPage } from '../pages/login.page';
import { A } from '../testcases/homepage-tests.spec';


export class AA{

 static async loginnn(page) {
    const aa = new LoginPage(page)
    await aa.login(page);
    await A.loggingIn();
    
}

static async loginUsing(credentials){
    await A.loginUsingCredentials('LB-ibg-lob-opt');
}
}