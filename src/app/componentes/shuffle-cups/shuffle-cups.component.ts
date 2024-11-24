import { Component, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton } from "@ionic/angular/standalone";
import { TweenMax, Sine } from 'gsap';
import { gsap } from 'gsap';
@Component({
  selector: 'app-shuffle-cups',
  templateUrl: './shuffle-cups.component.html',
  styleUrls: ['./shuffle-cups.component.scss'],
  standalone: true,
  imports: [  CommonModule]
})
export class ShuffleCupsComponent implements AfterViewInit{
  private ballPosition = 0;
  private ballElement = document.getElementById('ball')!;  // Elemento de la bola
  private cloches: NodeListOf<Element> | null = null;
  private picos: NodeListOf<Element> | null = null;
  


  ngAfterViewInit() {
    // Aquí seleccionamos los elementos una vez que el componente esté completamente inicializado
    this.cloches = document.querySelectorAll('.cloche');
    this.picos = document.querySelectorAll('.pico');
  }
  // Inicia el juego y posiciona la bola bajo una cloche aleatoria
  async startGame() {
    const ball = document.getElementById('ball');
    if (ball) {
      const cloches = document.querySelectorAll('.cloche');
      const picos = document.querySelectorAll('.pico');
  
      // Reiniciar las clases y esconder la bola
      picos.forEach(pico => pico.classList.remove('revealed'));
      cloches.forEach(cloche => cloche.classList.remove('revealed'));
      ball.style.display = 'none';
  
      // Posicionar la bola bajo una cloche al azar
      this.ballPosition = Math.floor(Math.random() * 3) + 1;
      const chosenCloche = document.querySelector(`.cloche-${this.ballPosition}`) as HTMLElement;
  
      if (chosenCloche) {
        ball.style.left = `${chosenCloche.offsetLeft + 35}px`;
        ball.style.display = 'block';
  
        // Mezclar cloches
        this.shuffleCloches();
        this.shuffleCloches();
        this.shuffleCloches();
        this.shuffleCloches();
        this.shuffleCloches();
        
      } else {
        console.error('No se pudo encontrar la cloche seleccionada');
      }
    } else {
      console.error('No se pudo encontrar el elemento de la bola');
    }
  }
  
  

  // Mezcla las cloches de manera aleatoria
  shuffleCloches() {
    for (let i = 0; i < 5; i++) {  // Retorna una promesa para esperar la animación
      const positions = [
        { left: '10%', top: '150px' },
        { left: '40%', top: '150px' },
        { left: '70%', top: '150px' }
      ];
    
        // Asegúrate de que 'picos' y 'cloches' estén inicializados
      if (this.picos && this.cloches) {
        // Aleatorizamos las posiciones de las cloches
        positions.sort(() => Math.random() - 0.5); // Aleatorizar el orden
        let animationsComplete = 0; // Contador de animaciones completadas
        // Movemos tanto los picos como las cloches a las mismas posiciones,
        // pero los picos estarán 7% más a la izquierda.
        this.picos.forEach((pico, index) => {
          const newPosition = positions[index];
          const adjustedPosition = {
            left: `calc(${newPosition.left} + 7%)`, // Ajustamos la posición de los picos
            top: newPosition.top
          };
  
          gsap.to(pico, {
            duration: 1,
            left: adjustedPosition.left,
            top: adjustedPosition.top,
            ease: 'power1.inOut',
            onComplete: () => {
              animationsComplete++;
              if (this.picos && this.cloches){
                if (animationsComplete === this.picos.length + this.cloches.length) {
                    // Resolvemos la promesa cuando todas las animaciones hayan terminado
                }
              }
            }
          });
        });
  
        // Animación para mover las cloches
        this.cloches.forEach((cloche, index) => {
          const newPosition = positions[index]; // Usamos la misma posición para cloches
          gsap.to(cloche, {
            duration: 1,
            left: newPosition.left,
            top: newPosition.top,
            ease: 'power1.inOut',
            onComplete: () => {
              animationsComplete++;
              if (this.picos && this.cloches){
                if (animationsComplete === this.picos.length + this.cloches.length) {
                    // Resolvemos la promesa cuando todas las animaciones hayan terminado
                }
              }
            }
          });
          // Mover la pelota debajo de la cloche
          this.followCloche(cloche, newPosition);
        });
      }
    }
  }
  

    // Detener la animación después de un tiempo

  stopShuffling() {
    // Detener el giro de las cloches y hacerlas que se queden en su lugar
    const picos = document.querySelectorAll('.picos');
    picos.forEach(pico => {
      gsap.to(pico, {
        duration: 0.5,  // Duration is now a property
        rotation: 0,    // Asegurarse de que las cloches dejen de girar
        ease: 'sine.inOut'  // Use 'sine.inOut' in string form
      });
    });

    const cloches = document.querySelectorAll('.cloche');
    cloches.forEach(cloche => {
      gsap.to(cloche, {
        duration: 0.5,  // Duration is now a property
        rotation: 0,    // Asegurarse de que las cloches dejen de girar
        ease: 'sine.inOut'  // Use 'sine.inOut' in string form
      });
    });
  }
  
  followCloche(cloche: Element, newPosition: { left: string, top: string }) {
      // Actualizamos la posición de la bola para que siga a la cloche
      const clocheElement = cloche as HTMLElement;
      const clocheCenterX = clocheElement.offsetLeft + clocheElement.offsetWidth / 2;
      const clocheCenterY = clocheElement.offsetTop + clocheElement.offsetHeight / 2;
  
      // Mover la bola a la nueva posición de la cloche
      gsap.to(this.ballElement, {
        duration: 1,  // Duration is now a property
        left: `${clocheCenterX - 30}px`,  // Ajustamos para que la bola se alinee con el centro de la cloche
        top: `${clocheCenterY - 30}px`,
        ease: 'easeInOut',  // Use standard easing
      });
  }
  
  // Revelar una cloche específica
  revealCloche(clocheNumber: number) {
    console.log(`Cloche clickeada: ${clocheNumber}`); // Verificar el clic
    const ball = document.getElementById('ball');
  
    const cloches = document.querySelectorAll('.cloche');
    const picos = document.querySelectorAll('.pico');
  
    if (cloches.length >= clocheNumber) {
      const cloche = cloches[clocheNumber - 1];
      const pico = picos[clocheNumber - 1];
  
      cloche.classList.add('revealed');
      pico.classList.add('revealed');
  
      setTimeout(() => {
        if (ball) {
          if (clocheNumber === this.ballPosition) {
            alert('¡Encontraste la bola! 🎉');
            ball.style.display = 'block';
          } else {
            alert('¡Inténtalo de nuevo! 😢');
            cloche.classList.remove('revealed');
            pico.classList.remove('revealed');
          }
        }
      }, 500);
    } else {
      console.error(`No se pudo encontrar la cloche ${clocheNumber}`);
    }
  }
  
  
}
