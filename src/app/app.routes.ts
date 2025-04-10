import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AdminComponent } from './components/admin/admin.component';
import { authGuard } from './core/auth.guard';
import { AdminMessagesComponent } from './components/admin/admin-messages/admin-messages.component';
import { DisplayMessageComponent } from './components/display-message/display-message.component';
import { MessageResolverService } from './core/message-resolver.service';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
    { path: 'admin/messages', component: AdminMessagesComponent, canActivate: [authGuard] },
    {
        path: 'message/:messageNumber',
        component: DisplayMessageComponent,
        resolve: { message: MessageResolverService }
    },
    { path: '**', redirectTo: '' } // Redirect to home for any unknown routes
];
