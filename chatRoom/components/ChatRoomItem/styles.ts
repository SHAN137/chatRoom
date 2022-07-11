import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: 15,
      // backgroundColor: 'lightblue',
      // position: 'absolute',
    },
    image: {
      width: 50,
      height: 50,
      borderRadius: 5,
    },
    groupImage: {
      width: 23,
      height: 23,
      borderRadius: 2,
      margin: 1,
      backgroundColor: '#aaa'
    },
    badgeContainer: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: 'white',
      backgroundColor: '#3872E9',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      left: 50,
      top: 16,
    },
    badgeText: {
      fontSize: 10,
      color: 'white',
    },
    rightContainer: {
      flex: 1,
      // backgroundColor: '#aaa',
      justifyContent: 'center',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      // backgroundColor: 'lightpink'
    },
    name: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    text: {
      fontSize: 16,
      color: 'grey'
    }
  });

  export default styles;