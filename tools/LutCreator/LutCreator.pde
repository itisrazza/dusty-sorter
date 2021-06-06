import java.awt.event.KeyEvent; //<>// //<>// //<>//
import java.util.*;

final int SIZE = 300;
final int HANDLE_SIZE = 8;
int x = 0;

float[] points = new float[8];
PVector topLeft;

float startTime = 16;  // 4 PM
float endTime = 24+6;  // 6 AM next day

String status = "[S] Save points - [R] Reload points - [E] Export Lookup Table";
int lutPerPoint = 32;

float[] lutPreview = null;

void setup() {
  size(640, 480);
  for (int i = 0; i < points.length; i++) {
    points[i] = random(1);
  }

  topLeft = new PVector(width / 2 - SIZE / 2, height / 2 - SIZE / 2);
}

void draw() {
  colorMode(RGB);
  background(255, 255, 255);

  pushMatrix();
  translate(width / 2 - SIZE / 2, height / 2 - SIZE / 2);

  stroke(0);
  noFill();
  rect(0, 0, SIZE, SIZE);

  beginShape();
  curveVertex(0, 150);
  for (int i = 0; i < points.length; i++) {
    PVector p = pointVector(i);
    curveVertex(p.x, p.y);
  }
  curveVertex(300, 150);
  endShape(OPEN);

  for (int i = 0; i < points.length; i++) {
    drawPoint(i);
  }
  popMatrix();

  noStroke();
  fill(0);
  textAlign(LEFT);
  text("0.0f", 
    width  / 2 - SIZE / 2 - 24, 
    height / 2 - SIZE / 2 +  2);
  text("1.0f", 
    width  / 2 - SIZE / 2 - 24, 
    height / 2 + SIZE / 2 +  6);
  text("1.0f", 
    width  / 2 + SIZE / 2 +  2, 
    height / 2 - SIZE / 2 +  2);

  textAlign(CENTER);
  text("Mood", 
    width  / 2, 
    height / 2 - SIZE / 2 - 2);

  textAlign(RIGHT);
  text("Vibe", 
    width  / 2 - SIZE / 2 - 2, 
    height / 2);

  textAlign(LEFT);
  text("Count: " + points.length + " (+/-)", 16, 16);
  text("LUT Entries: " + lutPerPoint + " per point, " + lutPerPoint * points.length + " in total ([/])", 16, 32);

  int hover = draggedVectorIndex >= 0 ? draggedVectorIndex : hoverPoint();
  if (hover >= 0) {
    text("Point " + hover + " -> " + points[hover], 16, 64);
    text("Approx " + (startTime + (endTime - startTime) / (points.length - 1) * hover) % 24, 16, 48);
  }

  text(status, 16, height - 16);
}

void keyPressed() {
  println(key);
  println(keyCode);

  if (key == '=' || key == '+') {
    points = Arrays.copyOf(points, points.length + 1);
  }

  if (key == '-') {
    points = Arrays.copyOf(points, points.length - 1);
  }

  if (key == '[') {
    lutPerPoint--;
  }

  if (key == ']') {
    lutPerPoint++;
  }

  if (key == 's' || key == 'S') {
    savePoints();
  }

  if (key == 'r' || key == 'R') {
    loadPoints();
  }

  if (key == 'e' || key == 'E') {
    dumpLUT();
  }
}

int draggedVectorIndex = -1;

void mousePressed() {
  draggedVectorIndex = hoverPoint();
}

void mouseDragged() {
  if (draggedVectorIndex < 0) return;

  points[draggedVectorIndex] = ((float)SIZE - (mouseY - topLeft.y)) / SIZE;
}

void mouseReleased() {
  draggedVectorIndex = -1;
}

PVector pointVector(int index) {
  return new PVector((float) SIZE / (points.length - 1) * index, 300 - points[index] * 300);
}

PVector pointRealVector(int index) {
  return new PVector(1.0 / (points.length - 1) * index, points[index]);
}

boolean pointMouseOver(int index) {
  PVector p = pointVector(index).add(topLeft);
  return (mouseX >= p.x - HANDLE_SIZE / 2
    && mouseX <  p.x + HANDLE_SIZE / 2
    && mouseY >= p.y - HANDLE_SIZE / 2
    && mouseY <  p.y + HANDLE_SIZE / 2);
}

int hoverPoint() {
  for (int i = 0; i < points.length; i++) {
    if (pointMouseOver(i)) {
      return i;
    }
  }
  return -1;
}

void drawPoint(int index) {
  colorMode(HSB, 100);
  float hue = (float) index / points.length * 100.f;
  PVector p = pointVector(index);

  fill(hue, 100, draggedVectorIndex == index ? 100 : 80);
  stroke(hue, 100, draggedVectorIndex == index ? 50 : 30);
  rect(p.x - 4, p.y - 4, 8, 8);

  colorMode(RGB);
  fill(0, 0, 0);
  textAlign(CENTER);
  text(index, p.x, p.y - 8);
}

void dumpLUT() {
  status = "Writing to file...";

  PrintWriter w = createWriter("vibelut.txt");
  w.println(points.length);
  w.println(lutPerPoint);
  for (int i = 0; i < points.length - 1; i++) {
    for (float v : getLUTForPoint(i)) {
      w.println(v);
    }
  }

  w.flush();
  w.close();
  status = "Wrote LUT to file.";
}

void savePoints() {
  PrintWriter w = createWriter("points.txt");
  w.println(points.length);
  for (int i = 0; i < points.length - 1; i++) {
    w.println(points[i]);
  }
  w.flush();
  w.close();
  status = "Wrote points to file.";
}

void loadPoints() {
  BufferedReader r = createReader("points.txt");
  String line;
  float[] newPoints = null;
  
  if (r == null) {
    status = "File not found.";
    return;
  }

  int i = 0;
  try {
    while ((line = r.readLine()) != null) {
      if (newPoints == null) {
        newPoints = new float[int(line)];
      } else {
        newPoints[i++] = float(line);
      }
    }
    points = newPoints;
  } 
  catch (IOException e) {
    status = "Failed to read.";
  }
}

float[] getLUTForPoint(int index) {
  float[] lut = new float[lutPerPoint];

  PVector cp1 = index > 0 ? pointRealVector(index - 1) : new PVector(0, 0.5);
  PVector  p1 = pointRealVector(index);
  PVector  p2 = pointRealVector(index + 1);
  PVector cp2 = index < points.length - 3 ? pointRealVector(index + 2) : new PVector(1, 0.5);

  for (int i = 0; i < lutPerPoint; i++) {
    float curvePoint = (float) i / (lutPerPoint - 1);
    lut[i] = curvePoint(cp1.y, p1.y, p2.y, cp2.y, curvePoint);
  }

  return lut;
}
