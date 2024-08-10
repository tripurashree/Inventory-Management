'use client'

import { useState, useEffect } from 'react'
import { 
  Box, 
  Stack, 
  Typography, 
  Button, 
  Modal, 
  TextField, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  IconButton, 
  Tooltip,
  ThemeProvider,
  createTheme,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteIcon from '@mui/icons-material/Delete'
import { firestore, auth } from '../firebase'
import { useRouter } from 'next/router'
import { useAuthState } from 'react-firebase-hooks/auth'
import { signOut } from 'firebase/auth'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
  where,
} from 'firebase/firestore'

const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff',
    },
    secondary: {
      main: '#28a745',
    },
    error: {
      main: '#dc3545',
    },
  },
})

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
}

const buttonStyle = {
  borderRadius: 2,
  padding: '12px 24px',
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState('')
  const [user, loading] = useAuthState(auth)
  const router = useRouter()

  const categories = ['Electronics', 'Furniture', 'Clothing', 'Miscellaneous']

  const updateInventory = async () => {
    if (user) {
      const snapshot = query(
        collection(firestore, 'inventory'),
        where('userId', '==', user.uid)
      )
      const docs = await getDocs(snapshot)
      const inventoryList = []
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() })
      })
      setInventory(inventoryList)
    }
  }

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login')
    } else if (user) {
      updateInventory()
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div>

  if (!user) return null

  const addItem = async () => {
    const docRef = doc(collection(firestore, 'inventory'), itemName)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1, userId: user.uid, category })
    } else {
      await setDoc(docRef, { quantity: 1, userId: user.uid, category })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists() && docSnap.data().userId === user.uid) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1, userId: user.uid })
      }
    }
    await updateInventory()
  }

  const increaseQuantity = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists() && docSnap.data().userId === user.uid) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1, userId: user.uid })
    }
    await updateInventory()
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setItemName('')
    setCategory('')
    setOpen(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Box
          width="100%"
          minHeight="100vh"
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={4}
          py={4}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Inventory Management
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={buttonStyle}
          >
            Add New Item
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleSignOut}
            sx={buttonStyle}
          >
            Sign Out
          </Button>

          <Grid container spacing={3}>
            {inventory.map(({ name, quantity, category }) => (
              <Grid item xs={12} sm={6} md={4} key={name}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    transition: '0.3s', 
                    '&:hover': { transform: 'translateY(-5px)' } 
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography variant="body1">
                      Quantity: {quantity}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Category: {category}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="Decrease Quantity">
                      <IconButton onClick={() => removeItem(name)} color="error">
                        <RemoveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Increase Quantity">
                      <IconButton onClick={() => increaseQuantity(name)} color="secondary">
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Item">
                      <IconButton onClick={() => removeItem(name)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
            Add Item
          </Typography>
          <Stack width="100%" direction={'column'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={() => {
                addItem()
                handleClose()
              }}
              color="primary"
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
    </ThemeProvider>
  )
}
