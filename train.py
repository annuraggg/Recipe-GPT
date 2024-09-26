import tensorflow as tf
from tensorflow.keras import layers, models
from datasets import load_dataset
from sklearn.model_selection import train_test_split
import numpy as np
import matplotlib.pyplot as plt

# Constants
BATCH_SIZE = 32
IMG_SIZE = (224, 224)
EPOCHS = 50  # Number of epochs for training

# Load the Food101 dataset from Hugging Face
dataset = load_dataset("food101", split="train[:100%]")

# Check the structure of a sample
print(dataset[0])

# Function to preprocess images and labels
def preprocess(example):
    # Convert to NumPy array (if necessary) and resize the image
    if isinstance(example['image'], np.ndarray):
        image = example['image']
    else:
        # Decode the image if it's not already a NumPy array
        image = np.array(example['image'])
        
    # Ensure the image is of the correct shape and type
    image = tf.image.resize(image, IMG_SIZE)
    
    # One-hot encode the label
    label = tf.one_hot(example['label'], 101)
    return image, label

# Apply preprocessing to the dataset
dataset = dataset.map(preprocess)

# Convert to TensorFlow Dataset
tf_dataset = dataset.to_tf_dataset(
    columns=['image'], 
    label_cols=['label'],
    batch_size=BATCH_SIZE,
    shuffle=True
)

# Split into train and validation sets (80-20 split)
train_size = 0.8
train_dataset, val_dataset = train_test_split(list(tf_dataset), test_size=(1 - train_size))

# Data augmentation for better generalization
data_augmentation = models.Sequential([
    layers.RandomFlip("horizontal_and_vertical"),
    layers.RandomRotation(0.2),
])

# Preprocessing input for MobileNetV2
preprocess_input = tf.keras.applications.mobilenet_v2.pre
