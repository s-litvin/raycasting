# Raycasting

Ray casting is the most basic of many computer graphics rendering algorithms that use the geometric algorithm of ray tracing. Ray tracing-based rendering algorithms operate in image order to render three-dimensional scenes to two-dimensional images. Geometric rays are traced from the eye of the observer to sample the light (radiance) travelling toward the observer from the ray direction. The speed and simplicity of ray casting comes from computing the color of the light without recursively tracing additional rays that sample the radiance incident on the point that the ray hit. This eliminates the possibility of accurately rendering reflections, refractions, or the natural falloff of shadows; however all of these elements can be faked to a degree, by creative use of texture maps or other methods. The high speed of calculation made ray casting a handy rendering method in early real-time 3D video games.

## Demo
Control the camera with the keyboard arrow and the mouse.

Check demo on GitHub page: https://s-litvin.github.io/raycasting/

![alt text](https://raw.githubusercontent.com/s-litvin/raycasting/master/preview.png)
