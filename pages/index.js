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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { firestore, auth } from '@/firebase'
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
  const [editMode, setEditMode] = useState(false)
  const [viewMode, setViewMode] = useState(false)
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [supplier, setSupplier] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [user, loading] = useAuthState(auth)
  const [currentItem, setCurrentItem] = useState(null)
  const router = useRouter()

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

  const handleOpen = () => {
    setItemName('')
    setCategory('')
    setQuantity(1)
    setSupplier('')
    setPrice('')
    setDescription('')
    setEditMode(false)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setViewMode(false)
    setCurrentItem(null)
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSave = async () => {
    const docRef = doc(collection(firestore, 'inventory'), itemName)
    const itemData = {
      category,
      quantity,
      supplier,
      price,
      description,
      userId: user.uid,
    }

    await setDoc(docRef, itemData)
    await updateInventory()
    handleClose()
  }

  const handleEdit = (item) => {
    setItemName(item.name)
    setCategory(item.category)
    setQuantity(item.quantity)
    setSupplier(item.supplier)
    setPrice(item.price)
    setDescription(item.description)
    setEditMode(true)
    setOpen(true)
  }

  const handleCardClick = (item) => {
    setCurrentItem(item)
    setViewMode(true)
    setOpen(true)
  }

  // Function to remove an item from the inventory
  const removeItem = async (itemName) => {
    const docRef = doc(firestore, 'inventory', itemName)
    await deleteDoc(docRef)
    await updateInventory()
  }

  const increaseQuantity = async (itemName) => {
    const docRef = doc(firestore, 'inventory', itemName)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const newQuantity = docSnap.data().quantity + 1
      await setDoc(docRef, { ...docSnap.data(), quantity: newQuantity })
      await updateInventory()
    }
  }
  const decreaseQuantity = async (itemName) => {
    const docRef = doc(firestore, 'inventory', itemName)
    const docSnap = await getDoc(docRef)
  
    if (docSnap.exists()) {
      const currentQuantity = docSnap.data().quantity
      if (currentQuantity > 1) {
        const newQuantity = currentQuantity - 1
        await setDoc(docRef, { ...docSnap.data(), quantity: newQuantity })
        await updateInventory()
      } else {
        console.log('Quantity cannot be less than 1')
      }
    }
  }
  

  const filteredInventory = inventory.filter(
    (item) => 
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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

          <TextField
            variant="outlined"
            placeholder="Search by item name or category"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mt: 2 }}
          />

          <Grid container spacing={3}>
            {filteredInventory.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.name}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    transition: '0.3s', 
                    '&:hover': { transform: 'translateY(-5px)' } 
                  }}
                  onClick={() => handleCardClick(item)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                    </Typography>
                    <Typography variant="body1">
                      Quantity: {item.quantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Category: {item.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supplier: {item.supplier}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Price: ${item.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Description: {item.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="Decrease Quantity">
                      <IconButton onClick={(e) => { e.stopPropagation(); decreaseQuantity(item.name) }} color="error">
                        <RemoveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Increase Quantity">
                      <IconButton onClick={(e) => { e.stopPropagation(); increaseQuantity(item.name) }} color="secondary">
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Item">
                      <IconButton onClick={(e) => { e.stopPropagation(); removeItem(item.name) }} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Item">
                      <IconButton onClick={(e) => { e.stopPropagation(); handleEdit(item) }} color="primary">
                        <EditIcon />
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
          {viewMode && currentItem ? (
            <>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                {currentItem.name}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                Category: {currentItem.category}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                Quantity: {currentItem.quantity}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                Supplier: {currentItem.supplier}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                Price: ${currentItem.price}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                Description: {currentItem.description}
              </Typography>
            </>
          ) : (
            <>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                {editMode ? 'Edit Item' : 'Add New Item'}
              </Typography>
              <TextField
                label="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
                disabled={editMode}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="electronics">Electronics</MenuItem>
                  <MenuItem value="furniture">Furniture</MenuItem>
                  <MenuItem value="clothing">Clothing</MenuItem>
                  <MenuItem value="accessories">Accessories</MenuItem>
                  <MenuItem value="food">Food</MenuItem>
                  <MenuItem value="books">Books</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                fullWidth
                type="number"
                sx={{ mt: 2 }}
              />
              <TextField
                label="Supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
              />
              <TextField
                label="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                fullWidth
                type="number"
                sx={{ mt: 2 }}
              />
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={4}
                sx={{ mt: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleSave}
                fullWidth
                sx={{ mt: 2 }}
              >
                {editMode ? 'Update Item' : 'Add Item'}
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </ThemeProvider>
  )
}
