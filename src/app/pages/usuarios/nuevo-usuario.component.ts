import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

import { UsuariosService } from 'src/app/services/usuarios.service';
import { AlertService } from '../../services/alert.service';

import gsap from 'gsap';

@Component({
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.component.html',
  styles: [
  ]
})
export class NuevoUsuarioComponent implements OnInit {

  // Permisos
  public permisos = {
    usuarios: 'USUARIOS_NOT_ACCESS',
    productos: 'PRODUCTOS_NOT_ACCESS'
  };

  // Modelo reactivo
  public usuarioForm: FormGroup;

  constructor(private fb: FormBuilder,
              private router: Router,
              private usuariosService: UsuariosService,
              private alertService: AlertService,
              private dataService: DataService
              ) { }

  ngOnInit(): void {
    
    // Animaciones y Datos de ruta
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Creando usuario';

    // Formulario reactivo
    this.usuarioForm = this.fb.group({
      usuario: ['', Validators.required],
      apellido: ['', Validators.required],
      nombre: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      repetir: ['', Validators.required],
      role: ['ADMIN_ROLE', Validators.required],
      activo: ['true', Validators.required]
    });

  }

  // Crear nuevo usuario
  nuevoUsuario(): void {

    const { status } = this.usuarioForm;
    const {usuario, apellido, nombre, dni, email, role, password, repetir} = this.usuarioForm.value;
    
    console.log(this.usuarioForm.valid);

    // Se verifica que los campos no tengan un espacio vacio
    const campoVacio = usuario.trim() === '' || 
                       apellido.trim() === '' ||
                       dni.trim() === '' || 
                       email.trim() === '' || 
                       nombre.trim() === '' ||
                       password.trim() === '' ||
                       repetir.trim() === '';

    // Se verifica si los campos son invalidos
    if(status === 'INVALID' || campoVacio){
      this.alertService.formularioInvalido();
      return;
    }

    // Se verifica si las contraseñas coinciden
    if(password !== repetir){
      this.alertService.info('Las contraseñas deben coincidir');
      return;   
    }

    // Se agregan los permisos
    let data: any = this.usuarioForm.value;
    
    if(role !== 'ADMIN_ROLE') data.permisos = this.adicionarPermisos();
    else data.permisos = [];

    this.alertService.loading();  // Comienzo de loading

    // Se crear el nuevo usuario
    this.usuariosService.nuevoUsuario(data).subscribe(() => {
      this.alertService.close();  // Finaliza el loading
      this.router.navigateByUrl('dashboard/usuarios');
    },( ({error}) => {
      this.alertService.close();  // Finaliza el loading
      this.alertService.errorApi(error.message);
      return;  
    }));

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

}
