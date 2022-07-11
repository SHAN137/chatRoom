import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: 10,
      // width: '90%',
      // backgroundColor: '#3872E9'
    },
    image: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    },
    rightContainer: {
      flex: 1,
      justifyContent: 'center',
      borderBottomColor: '#eee',
      borderBottomWidth: 1,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    name: {
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  export default styles;