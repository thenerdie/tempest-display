<script>
    import { onMount } from 'svelte';
    import * as THREE from 'three';

    let container;

    onMount(() => {
        // Initialize the scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();

        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        scene.add(sky);

        // Create the sun using a point light
        const sunLight = new THREE.PointLight(0xffffff, 1, 0);
        sunLight.position.set(100, 100, 100);
        scene.add(sunLight);

        // Create a visual representation for the sun
        const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(100, 100, 100);
        scene.add(sun);

        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            vertices.push(x, y, z);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const material = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.1 });

        const stars = new THREE.Points(geometry, material);
        scene.add(stars);

        camera.position.z = 5;

        const animate = () => {
            requestAnimationFrame(animate);

            // stars.rotation.x += 0.0001;
            stars.rotation.y += 0.0001;

            renderer.render(scene, camera);
        };

        animate();
    });
</script>

<div bind:this={container}></div>

<style>
    div {
        width: 100%;
        height: 100vh;
        position: fixed;
        z-index: -2;
    }
</style>
  