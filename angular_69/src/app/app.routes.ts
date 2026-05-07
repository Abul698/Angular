import { Routes } from '@angular/router';
import { Home } from './component/home/home';
import { ContactUs } from './component/contact-us/contact-us';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'contact', component: ContactUs},

];
