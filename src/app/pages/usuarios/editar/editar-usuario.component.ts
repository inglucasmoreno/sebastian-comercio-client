import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Usuario } from '../../../models/usuario.model';
import { UsuariosService } from '../../../services/usuarios.service';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';

import gsap from 'gsap';

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.component.html',
  styles: [
  ]
})
export class EditarUsuarioComponent implements OnInit {

  // Permisos
  public permisos = {
    usuarios: 'USUARIOS_NOT_ACCESS',
    productos: 'PRODUCTOS_NOT_ACCESS'
  };

  public id: string;
  public usuario: Usuario;
  public usuarioForm: FormGroup;

  constructor(private router: Router,
              private fb: FormBuilder,
              private activatedRoute: ActivatedRoute,
              private usuariosService: UsuariosService,
              private alertService: AlertService,
              private dataService: DataService) { }

  ngOnInit(): void {
    
    // Animaciones y Datos de ruta
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Editando usuario';

    // Formulario reactivo
    this.usuarioForm = this.fb.group({
      usuario: ['', Validators.required],
      apellido: ['', Validators.required],
      nombre: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', Validators.email],
      role: ['USER_ROLE', Validators.required],
      activo: ['true', Validators.required],
    });
  
    this.getUsuario(); // Datos iniciales de usuarios

  }

  // Datos iniciales de usuarios
  getUsuario(): void {
    
    // Se buscan los datos iniciales del usuario a editar
    this.alertService.loading();
    this.activatedRoute.params.subscribe(({id}) => { this.id = id; });
    this.usuariosService.getUsuario(this.id).subscribe(usuarioRes => {
      
      // Marcar permisos
      this.getPermisos(usuarioRes.permisos); // Se obtienen los permisos

      this.usuario = usuarioRes;
      const {usuario, apellido, nombre, dni, email, role, activo} = this.usuario;

      this.usuarioForm.patchValue({
        usuario,
        apellido,
        nombre,
        dni,
        email,
        role,
        activo: String(activo)
      });

      this.alertService.close();
    },({error})=> {
      this.alertService.errorApi(error.message); 
    });
  
  }

  // Se obtienen los permisos
  getPermisos(permisosFnc: Array<string>): void {
    
    permisosFnc.forEach( permiso => {
    
      // Usuarios
      (permiso === 'USUARIOS_ALL' || permiso === 'USUARIOS_READ') ? this.permisos.usuarios = permiso : null;

      // Productos
      (permiso === 'PRODUCTOS_ALL' || permiso === "PRODUCTOS_READ") ? this.permisos.productos = permiso : null;
    
    });

  }

  // Editar usuario
  editarUsuario(): void | boolean{
      
    const {usuario, apellido, dni, role, nombre, email} = this.usuarioForm.value;

    // Se verifica que los campos no tengan un espacio vacio
    const campoVacio = usuario.trim() === '' || 
                       apellido.trim() === '' || 
                       dni.trim() === '' || 
                       email.trim() === '' || 
                       nombre.trim() === '';

    // Se verifica que todos los campos esten rellenos
    if (this.usuarioForm.status === 'INVALID' || campoVacio){
      this.alertService.formularioInvalido()
      return false;
    }

    // Se agregan los permisos
    let data: any = this.usuarioForm.value;

    if(role !== 'ADMIN_ROLE') data.permisos = this.adicionarPermisos(); // Se adicionan los permisos a la data para actualizacion
    else data.permisos = [];

    this.alertService.loading();

    this.usuariosService.actualizarUsuario(this.id, data).subscribe(() => {
      this.alertService.close();
      this.router.navigateByUrl('dashboard/usuarios');
    }, ({error}) => {
      this.alertService.close();
      this.alertService.errorApi(error.message);
    });

  }

    
  // Se arma el arreglo de permisos
  adicionarPermisos(): any {

    let permisos: any[] = [];    
    
    // Seccion usuarios
    if(this.permisos.usuarios !== 'USUARIOS_NOT_ACCESS'){
      permisos.push('USUARIOS_NAV');
      permisos.push(this.permisos.usuarios);
    }
    
    // Seccion productos
    // if(this.permisos.productos !== 'PRODUCTOS_NOT_ACCESS'){
    //   permisos.push('PRODUCTOS_NAV');
    //   permisos.push(this.permisos.productos);
    // }
    
    return permisos;  
  
  }

  // Funcion del boton regresar
  regresar(): void{
    this.router.navigateByUrl('/dashboard/usuarios');
  }

}
